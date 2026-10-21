-- CloudWise learning history foundation.
-- Question content remains in the frontend; these tables store user-owned attempts.

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_attempt_id text not null check (length(btrim(client_attempt_id)) > 0),
  session_type text not null check (session_type in ('all', 'domain', 'revision')),
  domain text,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  question_count integer not null check (question_count > 0),
  score integer,

  constraint quiz_attempts_domain_type_check check (
    (session_type = 'domain' and domain is not null and length(btrim(domain)) > 0)
    or (session_type in ('all', 'revision') and domain is null)
  ),
  constraint quiz_attempts_completion_state_check check (
    (
      status = 'in_progress'
      and completed_at is null
      and score is null
    )
    or (
      status = 'completed'
      and completed_at is not null
      and completed_at >= started_at
      and score is not null
      and score between 0 and question_count
    )
  ),
  constraint quiz_attempts_client_id_unique unique (user_id, client_attempt_id),
  constraint quiz_attempts_id_owner_unique unique (id, user_id)
);

create table public.quiz_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null,
  user_id uuid not null,
  question_id bigint not null check (question_id > 0),
  selected_answer text not null check (length(btrim(selected_answer)) > 0),
  correct_answer text not null check (length(btrim(correct_answer)) > 0),
  is_correct boolean not null,
  domain text not null check (length(btrim(domain)) > 0),
  topic text not null check (length(btrim(topic)) > 0),
  answered_at timestamptz not null default now(),

  constraint quiz_responses_attempt_owner_fk
    foreign key (attempt_id, user_id)
    references public.quiz_attempts (id, user_id)
    on delete cascade,
  constraint quiz_responses_answer_consistency_check
    check (is_correct = (selected_answer = correct_answer)),
  constraint quiz_responses_attempt_question_unique unique (attempt_id, question_id)
);

create index quiz_attempts_user_completed_idx
  on public.quiz_attempts (user_id, completed_at desc)
  where status = 'completed';

create index quiz_responses_user_question_attempt_idx
  on public.quiz_responses (user_id, question_id, attempt_id);

alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;

-- Do not rely on Supabase default grants. No direct UPDATE is granted.
revoke all on table public.quiz_attempts from anon, authenticated;
revoke all on table public.quiz_responses from anon, authenticated;

grant select, insert, delete on table public.quiz_attempts to authenticated;
grant select, insert on table public.quiz_responses to authenticated;

create policy quiz_attempts_select_own
  on public.quiz_attempts
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy quiz_attempts_insert_own_in_progress
  on public.quiz_attempts
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'in_progress'
    and completed_at is null
    and score is null
  );

create policy quiz_attempts_delete_own
  on public.quiz_attempts
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Keep attempt chronology server-generated, even if a client submits a value.
create function public.set_quiz_attempt_started_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.started_at := pg_catalog.clock_timestamp();
  return new;
end;
$function$;

revoke all on function public.set_quiz_attempt_started_at() from public, anon, authenticated;

create trigger quiz_attempts_set_started_at
  before insert on public.quiz_attempts
  for each row execute function public.set_quiz_attempt_started_at();

create policy quiz_responses_select_through_owned_attempt
  on public.quiz_responses
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.quiz_attempts as attempt
      where attempt.id = quiz_responses.attempt_id
        and attempt.user_id = (select auth.uid())
    )
  );

create policy quiz_responses_insert_into_owned_in_progress_attempt
  on public.quiz_responses
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.quiz_attempts as attempt
      where attempt.id = quiz_responses.attempt_id
        and attempt.user_id = (select auth.uid())
        and attempt.status = 'in_progress'
    )
  );

-- Serialize response insertion with completion. Without this lock, an insert
-- could pass the RLS status check while completion is counting responses.
create function public.guard_quiz_response_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  request_user_id uuid := auth.uid();
  attempt_status text;
  attempt_question_count integer;
  existing_response_count integer;
begin
  if request_user_id is null or new.user_id is distinct from request_user_id then
    raise exception 'Response owner does not match the authenticated user'
      using errcode = '42501';
  end if;

  select attempt.status, attempt.question_count
    into attempt_status, attempt_question_count
    from public.quiz_attempts as attempt
   where attempt.id = new.attempt_id
     and attempt.user_id = request_user_id
   for update;

  if not found or attempt_status <> 'in_progress' then
    raise exception 'Responses can only be added to an owned in-progress attempt'
      using errcode = '42501';
  end if;

  select count(*)::integer
    into existing_response_count
    from public.quiz_responses as response
   where response.attempt_id = new.attempt_id;

  if existing_response_count >= attempt_question_count then
    raise exception 'Attempt already has its expected number of responses'
      using errcode = '23514';
  end if;

  -- Never trust a browser-supplied answer timestamp.
  new.answered_at := pg_catalog.clock_timestamp();

  return new;
end;
$function$;

revoke all on function public.guard_quiz_response_insert() from public, anon, authenticated;

create trigger quiz_responses_guard_insert
  before insert on public.quiz_responses
  for each row execute function public.guard_quiz_response_insert();

-- Completion is the only way to transition an attempt out of in_progress.
-- It returns only the row owned by auth.uid() and calculates score in-database
-- from response snapshots. The frontend still supplies the answer key, so this
-- protects consistency, not against a user tampering with their own browser.
create function public.complete_quiz_attempt(p_attempt_id uuid)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = ''
as $function$
declare
  request_user_id uuid := auth.uid();
  attempt_row public.quiz_attempts%rowtype;
  response_count integer;
  calculated_score integer;
begin
  if request_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  select attempt.*
    into attempt_row
    from public.quiz_attempts as attempt
   where attempt.id = p_attempt_id
     and attempt.user_id = request_user_id
   for update;

  if not found then
    raise exception 'Attempt not found or not owned by the authenticated user'
      using errcode = 'P0002';
  end if;

  if attempt_row.status <> 'in_progress' then
    raise exception 'Only an in-progress attempt can be completed'
      using errcode = '55000';
  end if;

  select count(*)::integer,
         (count(*) filter (where response.is_correct))::integer
    into response_count, calculated_score
    from public.quiz_responses as response
   where response.attempt_id = p_attempt_id
     and response.user_id = request_user_id;

  if response_count <> attempt_row.question_count then
    raise exception 'Attempt has % responses; expected %', response_count, attempt_row.question_count
      using errcode = '23514';
  end if;

  if attempt_row.session_type = 'domain' and exists (
    select 1
      from public.quiz_responses as response
     where response.attempt_id = p_attempt_id
       and response.user_id = request_user_id
       and response.domain <> attempt_row.domain
  ) then
    raise exception 'A domain attempt contains a response from a different domain'
      using errcode = '23514';
  end if;

  update public.quiz_attempts as attempt
     set status = 'completed',
         completed_at = pg_catalog.clock_timestamp(),
         score = calculated_score
   where attempt.id = p_attempt_id
     and attempt.user_id = request_user_id
     and attempt.status = 'in_progress'
  returning attempt.* into attempt_row;

  return attempt_row;
end;
$function$;

revoke all on function public.complete_quiz_attempt(uuid) from public, anon, authenticated;
grant execute on function public.complete_quiz_attempt(uuid) to authenticated;
