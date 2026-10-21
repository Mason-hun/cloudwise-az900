# Supabase Migration Security Review

**Review date:** 2026-10-21

**Scope:** Independent review of `supabase/migrations/20261021090000_create_learning_progress.sql`, `.gitignore`, `.env.example`, and the related claims in `docs/backend-architecture.md`. The migration received integrity hardening changes during this review (Medium finding M1). No frontend files were edited.

## Executive result

No confirmed Critical or High severity authorization issue was found in the current migration source. Both user-owned tables have RLS enabled; authenticated grants are explicitly limited; response visibility and insertion are bound to an owned parent attempt; direct UPDATE is not granted; and the completion RPC and insert trigger validate the caller and pin an empty `search_path`.

This is a source review, not proof that the migration runs or that Postgres enforces the intended behavior in this project. `supabase`, `psql`, Docker, a Supabase project, and credentials are unavailable. The migration has not been executed. Live tests remain mandatory before deployment.

## Findings by severity

### Critical

None identified from source inspection.

### High

None identified from source inspection. The lack of a live database test remains a deployment blocker for treating these policies as verified, but it is not itself evidence of a source-level authorization bypass.

### Medium

#### M1 — Client-controlled timestamps could misorder or falsify progress

**Affected SQL:** `quiz_attempts_completion_state_check`, trigger `quiz_attempts_set_started_at`, and trigger function `guard_quiz_response_insert()`.

Before this review, an authenticated client could supply a future `started_at` or arbitrary `answered_at`; the completion constraint did not require `completed_at >= started_at`. Those values could misrepresent history chronology even though they did not enable cross-user access.

**Fix applied:** The completed-state constraint now requires `completed_at >= started_at`; a before-insert trigger assigns `started_at` from the database clock; the response insert trigger replaces submitted `answered_at` with database time. The response trigger also rejects an insert once the expected response count has already been reached. These changes are in the migration and are reflected in `docs/backend-architecture.md`.

**Verification still needed:** Run database tests confirming client-supplied start/answer times are replaced, completion time follows start time, and concurrent inserts cannot exceed the expected count.

#### M2 — Score and response correctness are not authoritative

**Affected SQL:** `quiz_responses_answer_consistency_check` and `complete_quiz_attempt(p_attempt_id)`.

The constraint verifies only that `is_correct` agrees with the submitted `selected_answer` and `correct_answer`. The completion RPC calculates `score` from those rows, but the answer key is shipped to the browser. A signed-in user can alter their own response payload or client and submit a false `correct_answer`/`is_correct` pair. This does not grant access to another user's data, but it means scores and targeted-revision state are user-editable study history.

**Recommended handling:** Accept this limitation for personal practice records and do not describe stored scores as trusted exam results. If trusted scoring is later required, validate against an authoritative question/key source unavailable to the browser. Do not add a service-role key to the client.

#### M3 — The database cannot validate question-bank membership or all session semantics

**Affected SQL:** `quiz_responses.question_id`, `quiz_responses_attempt_question_unique`, and completion checks in `complete_quiz_attempt(p_attempt_id)`.

The database checks that `question_id > 0`, prevents duplicate question IDs within one attempt, checks response count, and checks response domains for a `domain` session. It has no question catalog or per-attempt expected-question list. It therefore cannot prove that a response ID exists in the current bank, that an option ID belongs to that question, that an `all`/`revision` response's topic/domain matches its question, or that the submitted set is the actual selected session. The current frontend bank remains the source for those facts.

**Recommended handling:** Keep the current limitation explicit for this learning app. If data integrity needs exceed personal study history, add a versioned authoritative question/session representation and validate responses against it before completion.

### Low

#### L1 — Owners can delete completed attempts

**Affected SQL:** grant `DELETE` on `quiz_attempts`, policy `quiz_attempts_delete_own`, and `quiz_responses_attempt_owner_fk ON DELETE CASCADE`.

An authenticated owner can delete their own completed attempt, which cascades to its responses. This is intentional support for clearing that user's cloud history and is not an ownership bypass. Completed attempts cannot be updated through table grants, and responses have no direct UPDATE or DELETE grant. The UI must make account-wide/cloud-history deletion explicit and confirmed.

#### L2 — Retries are safe from duplication but not API-idempotent

**Affected SQL:** `quiz_attempts_client_id_unique`, `quiz_responses_attempt_question_unique`, and `complete_quiz_attempt(p_attempt_id)`.

Duplicate attempt/response inserts fail on uniqueness constraints; repeated completion fails because the attempt is no longer `in_progress`. This prevents duplicate records or rewriting completed state, but a network retry returns a conflict rather than the original success result.

**Recommended handling:** The future repository should re-read by `(user_id, client_attempt_id)` or attempt ID after an ambiguous network result, then treat an already completed owned attempt as success only after verifying its stored state. Do not weaken uniqueness or completed-row immutability to simplify retries.

#### L3 — Local-history import is not supported by this migration

**Affected SQL:** `quiz_attempts_insert_own_in_progress` and `complete_quiz_attempt(p_attempt_id)`.

Clients may insert only in-progress attempts; completion assigns `completed_at` from the database clock. Consequently, the proposed opt-in local-history import cannot preserve the original completion timestamps through current client privileges.

**Recommended handling:** As documented in `docs/backend-architecture.md`, design and test a separate narrowly scoped authenticated import RPC before offering import. Do not allow direct completed-row inserts or use a service-role key in the browser.

## Control-by-control review

### SQL structure and integrity controls

- `quiz_attempts` references `auth.users(id) ON DELETE CASCADE`; `quiz_responses` has a composite FK to `(quiz_attempts.id, user_id) ON DELETE CASCADE`. The composite key prevents a response from pairing another user's attempt ID with the caller's owner ID.
- Session type/domain and attempt status/score/timestamp states have CHECK constraints. The completion RPC checks exact response count and domain consistency for domain sessions.
- `UNIQUE (attempt_id, question_id)` prevents duplicate question responses within one attempt. `is_correct` must equal the equality of submitted option IDs.
- `quiz_attempts_user_completed_idx` supports per-user completed history; `quiz_responses_user_question_attempt_idx` supports per-user question history/revision lookup.
- SQL appears structurally plausible by manual inspection, including the composite FK, PL/pgSQL trigger/RPC, aggregate `FILTER`, and grants. The PostgreSQL parser, migration transaction behavior, FK cascade/RLS interaction, PostgREST RPC exposure, and trigger locking have not been exercised. These remain explicitly unverified.

### RLS, grants, and cross-user access

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` is present for both owned tables.
- `anon` and `authenticated` table privileges are revoked, then only required authenticated operations are granted. Attempts receive SELECT/INSERT/DELETE; responses receive SELECT/INSERT. Neither receives UPDATE; responses also receive no direct DELETE.
- Attempt SELECT/DELETE require `user_id = auth.uid()`. Attempt INSERT requires caller ownership and an `in_progress` state with null completion and score.
- Response SELECT requires both the row owner to equal `auth.uid()` and an existing parent attempt owned by that caller. Response INSERT has the same owner and parent check, additionally requiring parent status `in_progress`.
- Supplying another user's `attempt_id` cannot satisfy the RLS parent check; the composite FK independently rejects a mismatched `(attempt_id, user_id)` pair. This conclusion is based on SQL policy/source review, not a two-user execution test.
- Authenticated users cannot change `user_id` or other fields through direct UPDATE because no UPDATE grant is present. The RPC changes only status, completed time, and score for a parent row selected by both `p_attempt_id` and `auth.uid()`.

### Definer functions and race behavior

- `guard_quiz_response_insert()` and `complete_quiz_attempt(uuid)` are `SECURITY DEFINER`, use `SET search_path = ''`, and schema-qualify application relations and `auth.uid()`.
- Both explicitly bind work to `auth.uid()`. The completion RPC does not accept owner, score, or status arguments. Its execute privilege is revoked from `PUBLIC`, `anon`, and `authenticated` then granted only to `authenticated`. The trigger function's execute privilege is revoked from all three; it is used only by its table trigger.
- The trigger locks the parent attempt `FOR UPDATE`; completion also locks that row before counting responses. This is intended to serialize inserts with completion. Unique constraints handle duplicate response submissions. A failed RPC raises an exception, so its statement transaction should roll back; transaction and lock behavior still needs live verification.
- Direct updates to completed attempt/response rows are not available to `authenticated`. Deleting an owned attempt remains intentionally allowed and cascades its responses (L1).

### Environment safety

- `.gitignore` ignores `.env` and `.env.*`, with `!.env.example` allowing the template. `git check-ignore` confirmed `.env` and `.env.local` are ignored and `.env.example` is not ignored.
- `.env.example` contains only obvious placeholders for the public Supabase URL and publishable key. No actual credentials or service-role key were found in it. No frontend auth/client integration exists in this scope.
- Vite `VITE_` variables are public once built; only a publishable key belongs there. A service-role/secret key must remain server-side.

## Live database test plan

No Supabase CLI, `psql`, Docker, project, or credentials are currently available. Before applying this migration to any shared project, run it from a clean local Supabase database and add repeatable `supabase/tests/` database tests. At minimum test:

1. User A can insert/read/delete only their own in-progress and completed attempts; User B cannot select or delete them by known UUID.
2. User A cannot insert a response naming User B's attempt, spoof `user_id`, or read User B's responses.
3. Authenticated direct UPDATE on attempts/responses and direct response DELETE are denied by SQL privileges; attempt deletion cascades.
4. Duplicate `(attempt_id, question_id)` responses fail; too few responses cannot complete; excess responses are rejected; duplicate attempt IDs per owner fail.
5. Completion is denied for another user's ID, an absent ID, an already completed attempt, an incomplete response count, and domain mismatch; correct count computes the exact score.
6. Completion and response insertion races serialize correctly; a late response is rejected after completion. Verify rollback leaves no partially completed attempt.
7. RLS behavior holds when requests use the actual `authenticated` role/JWT claims rather than a service-role connection.
8. Client-supplied `started_at` and `answered_at` are replaced by database times; `completed_at` cannot precede `started_at`.

The official Supabase guidance recommends an empty `search_path`, schema-qualified object names, owner checks inside definer functions, and explicit EXECUTE grants for these functions ([Supabase database functions](https://supabase.com/docs/guides/database/functions)). Supabase also documents database-level RLS tests under `supabase/tests/` ([Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)). PostgreSQL documents that INSERT/UPDATE `WITH CHECK` policies are applied after BEFORE ROW triggers ([PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)) and that newly created functions grant EXECUTE to `PUBLIC` by default unless revoked ([PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/16/sql-createfunction.html)).

## Final disposition

**Source review: no confirmed Critical/High issue; conditional readiness only.** The migration is not ready to be called security-verified or applied to a production Supabase project until it has been parsed/applied and the two-user, privilege, completion, and concurrency tests above pass. The Medium limitations (client-trusted scoring and lack of question-catalog validation) are acceptable only if cloud records remain personal learning history, not trusted exam results.
