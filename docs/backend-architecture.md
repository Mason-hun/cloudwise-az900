# CloudWise Backend Architecture and Supabase Readiness

**Status:** Database foundation prepared locally. No Supabase project has been created or linked, and the migration has not been applied to or tested against a Supabase/PostgreSQL database.

## 1. Repository state and current application

The inspected branch is `feat/stitch-inspired-redesign`. At inspection time, the worktree contained modified `src/main.js` and `src/style.css`, plus untracked `design-references/`. These existing changes are preserved. Recent commits were:

- `6da4f1e docs: improve CloudWise project README`
- `625a91a fix: clarify CloudWise questions and document audit`
- `4d547c3 feat: expand and validate AZ-900 question bank`
- `f5c78c2 feat: add persistent practice history and revision`
- `36d6f14 feat: add domain-based performance summary`

The app is a Vite static frontend with vanilla JavaScript and CSS. There is no server-side runtime, auth system, Supabase dependency, or database deployment configuration. `npm run build` produces the static `dist/` directory. The repository now contains an initial migration at `supabase/migrations/20261021090000_create_learning_progress.sql` and ignores local `.env` files while allowing the placeholder-only `.env.example`.

### Current learning data flow

1. `src/data/questions.js` exports the static bank. Each question has a numeric `id` (currently 1–36), `domain`, `topic`, `objective`, prompt, option IDs/text, correct option ID, and explanation. The question bank is bundled into the browser.
2. `startSession()` chooses all questions, one domain's questions, or the revision list. It resets the in-memory selected answer and response array. No attempt or response is persisted while the learner is answering.
3. Submitting an answer appends `{ questionId, selectedAnswer, isCorrect }` to in-memory `answers`. Results and answer review resolve the question and its explanation from the current static bank by ID.
4. On the last question, `createPracticeAttempt()` checks that each session question has one answer and builds a completed record. It adds the question's `correctAnswer`, `domain`, and `topic`, calculates score, and adds an attempt ID and ISO completion timestamp. `savePracticeAttempt()` appends the record to `localStorage` under `cloudwise-az900.practice-history`, inside a version-1 payload.
5. Dashboard history summaries calculate completed-session count, latest attempt, cumulative correct/answered totals by domain, and storage/error state from that payload. Results performance is calculated for the just-finished session.
6. `getLatestMissedQuestions()` walks attempts in their stored order and remembers the last response per `questionId`. A question is eligible for targeted revision only when that latest response has `isCorrect === false` and the ID still exists in the current question bank. A later correct response removes it. Revision attempts are ordinary completed attempts and participate in this same rule.
7. Reset removes the complete local history payload after confirmation. Leaving an unfinished session discards its in-memory answers without saving.

The existing local attempt contract is:

```text
attempt: id, completedAt, type, domain, questionCount, score, answers[]
answer: questionId, selectedAnswer, correctAnswer, isCorrect, domain, topic
```

`type` is `all`, `domain`, or `revision`. `domain` is set for a domain session and `null` otherwise. Answer option IDs are strings such as `a`–`d`; question IDs are currently numbers. These question IDs must remain stable and unique because results, revision lookup, and history all resolve them. If IDs or their underlying meanings change, an explicit compatibility/versioning plan is needed.

## 2. Recommended minimal architecture

Keep the question bank in the frontend. Add only an auth/client boundary and a learning-progress repository when implementation begins:

```text
src/lib/supabaseClient.js          public browser client configuration
src/data/authRepository.js         sign-in, sign-out, session/user subscription
src/data/learningProgress.js       attempts/responses read-write functions
src/data/practiceHistory.js        retain local adapter and current contract
src/main.js                        quiz domain logic and rendering; call repositories
supabase/migrations/*.sql          versioned schema, RLS, indexes, RPCs
```

Use the official `@supabase/supabase-js` client when integrating. It has not been installed. The UI should depend on repository results rather than embedding Supabase queries throughout event handlers. Inject or initialize repositories at the app boundary so pure quiz selection, scoring/presentation behavior, and local history tests remain independent of network services.

The repository should expose operations along the lines of `listAttempts()`, `loadAttemptResponses(attemptId)`, `startAttempt(...)`, `recordResponse(...)`, `completeAttempt(attemptId)`, and `deleteOwnHistory()`. The repository derives ownership from the authenticated session; it must not accept a caller-provided `userId` as authorization. Keep return/error states explicit so unavailable network/auth does not silently look like an empty history.

### Minimal schema

No `profiles` table is needed now. Supabase Auth already owns authentication identifiers and email metadata, and the current UI does not need a display name or other profile fields. If a future product feature needs profile-specific application data, add a one-to-one `profiles(user_id uuid primary key references auth.users(id) on delete cascade, ...)` table with only those fields.

#### `public.quiz_attempts`

One row per user's selected practice session.

| Column | Type | Constraints / purpose |
|---|---|---|
| `id` | `uuid` | Primary key, generated by PostgreSQL. |
| `user_id` | `uuid` | Not null; FK to `auth.users(id) ON DELETE CASCADE`; owner. |
| `client_attempt_id` | `text` | Not null; original local attempt `id`, retained for idempotent imports and adapter compatibility. Unique with `user_id`. Text is required because the existing fallback ID is not guaranteed to be a UUID. |
| `session_type` | `text` | Not null; check in `all`, `domain`, `revision`. |
| `domain` | `text` | Nullable; required only when `session_type = 'domain'`; null for `all` and `revision`, matching current data. |
| `status` | `text` | Not null; check in `in_progress`, `completed`. Distinguishes a draft from a completed learning record. |
| `started_at` | `timestamptz` | Not null, defaults to `now()`; a before-insert trigger replaces client input with database time. |
| `completed_at` | `timestamptz` | Null while in progress; required when completed. Completion order for history/revision. |
| `question_count` | `integer` | Not null, greater than zero; expected session response count. |
| `score` | `integer` | Null while in progress; completed score, constrained between zero and `question_count`. |

The migration enforces the `session_type`/`domain` relationship and requires `(status = 'in_progress' AND completed_at IS NULL AND score IS NULL)` or `(status = 'completed' AND completed_at IS NOT NULL AND completed_at >= started_at AND score IS NOT NULL AND score BETWEEN 0 AND question_count)`. A before-insert trigger assigns `started_at` using the database clock rather than trusting a client timestamp. It adds a unique constraint on `(user_id, client_attempt_id)` and a composite unique key `(id, user_id)` for the response ownership foreign key. A partial index on `(user_id, completed_at DESC)` supports the signed-in user's completed history.

#### `public.quiz_responses`

One row per answered question in an attempt. Responses are append-only while their parent attempt is in progress; after completion they are immutable.

| Column | Type | Constraints / purpose |
|---|---|---|
| `id` | `uuid` | Primary key, generated by PostgreSQL. |
| `attempt_id` | `uuid` | Not null; part of composite FK to `(quiz_attempts.id, quiz_attempts.user_id) ON DELETE CASCADE`. |
| `user_id` | `uuid` | Not null; duplicated owner key, FK to `auth.users(id) ON DELETE CASCADE`, and part of the composite attempt FK. RLS checks it against `auth.uid()`. |
| `question_id` | `bigint` | Not null; the existing numeric question ID. |
| `selected_answer` | `text` | Not null; existing option ID, not option text. |
| `correct_answer` | `text` | Not null; answer-key option ID snapshot used by the current history format. |
| `is_correct` | `boolean` | Not null; check equals `(selected_answer = correct_answer)`. Snapshot of correctness at answer time. |
| `domain` | `text` | Not null; domain snapshot, matching current response record. |
| `topic` | `text` | Not null; topic snapshot, matching current response record. |
| `answered_at` | `timestamptz` | Not null, defaults to `now()`; the response trigger replaces client input with database time. |

The migration adds `UNIQUE (attempt_id, question_id)` so the same question is answered once per attempt, and an index on `(user_id, question_id, attempt_id)` for latest-response/revision retrieval. The response insert trigger serializes writes against completion, refuses responses once the attempt reaches `question_count`, and replaces client-provided `answered_at` with database time. The completion RPC verifies that response count equals `question_count`, then calculates and persists `score` from response snapshots before changing status to `completed`. Incomplete attempts are excluded from summaries and revision. Deleting an attempt cascades to its responses; deleting an Auth user cascades through attempts and responses.

The schema intentionally does not duplicate prompt, options, or explanation text. The UI continues to resolve those from the frontend bank by stable ID. `domain` and `topic` snapshots support the current summary contract. If historical answer review must remain text-identical after question wording/options change, introduce a question-bank version and retain the corresponding content snapshot before changing the bank's meaning; that is outside this initial schema.

### Integrity boundary

The app ships question IDs, options, and answer keys to the browser today. A signed-in user can therefore tamper with their own submitted response payload or local client and alter their own score/history. RLS prevents cross-user access; it does not make client-delivered answers trustworthy. A completion RPC can enforce internal consistency (one response per expected question, score matches stored `is_correct`, completed rows become immutable), but cannot prove the submitted key/correctness against a secret answer source while the bank remains client-side. There is also no question catalog FK: the database cannot prove an ID exists in the shipped bank, that an option belongs to it, or that a non-domain session's response metadata matches that question. Cloud progress should be treated as personal study history, not an authoritative exam result. If server-verifiable scores become a requirement, move answer-key validation behind a trusted server boundary or keep authoritative keys in a protected server-side store; do not put a service-role key in the app.

## 3. Row Level Security and ownership

Enable RLS on both tables and grant access only to the `authenticated` role. Never use a request-body `user_id` as proof of ownership. The browser client sends its Supabase session JWT; PostgreSQL's `auth.uid()` supplies the authenticated user ID. Every owner policy compares the row's `user_id` with that value. The composite foreign key prevents a response from naming one user's attempt while claiming another owner, and the response insert policy additionally requires an owned parent attempt in `in_progress` state.

The migration enables RLS on both tables and explicitly revokes default table privileges from `anon` and `authenticated` before granting only the required operations. Policy design:

| Table / operation | Policy |
|---|---|
| `quiz_attempts SELECT` | `USING (user_id = (select auth.uid()))`. |
| `quiz_attempts INSERT` | `WITH CHECK (user_id = (select auth.uid()) AND status = 'in_progress' AND completed_at IS NULL AND score IS NULL)`. |
| `quiz_attempts UPDATE` | No direct authenticated update grant/policy. Completion is a narrowly scoped RPC so completed records cannot be rewritten by changing payload fields. |
| `quiz_attempts DELETE` | `USING (user_id = (select auth.uid()))`. This allows a user to clear only their own cloud history; response rows cascade. |
| `quiz_responses SELECT` | `USING` requires both `user_id = auth.uid()` and an existing parent attempt whose owner is `auth.uid()`. |
| `quiz_responses INSERT` | `WITH CHECK` requires both `user_id = auth.uid()` and an existing parent attempt owned by `auth.uid()` in `in_progress`. Composite FK also enforces matching owner. |
| `quiz_responses UPDATE / DELETE` | No direct authenticated grant/policy. Responses are append-only; deleting an owned attempt cascades. |

The migration exposes `complete_quiz_attempt(attempt_id)` to `authenticated` only. It is a narrowly scoped `SECURITY DEFINER` function with an empty fixed `search_path`; execute is revoked from `PUBLIC`, `anon`, and `authenticated` before being granted back only to `authenticated`. It requires non-null `auth.uid()`, locks the attempt matching both the supplied ID and authenticated owner, rejects non-in-progress attempts, validates exact response count and domain-session consistency, computes score, and sets `completed_at` from the database clock. It accepts no user ID, score, owner, or status from the caller. A repeated completion returns a conflict and cannot alter the completed attempt. An internal `SECURITY DEFINER` response-insert trigger also uses a fixed empty `search_path`, verifies the caller/row owner, locks the parent while checking it is still in progress, rejects excess response rows, and sets `answered_at` itself; direct execution is revoked. A separate invoker trigger assigns `started_at` from the database clock. These locks prevent a concurrent insert from passing a stale status check as completion commits.

These rules must be created and tested in migrations against local Supabase/Postgres with separate users, including attempts to read, insert, update, and delete using another user's IDs. RLS is not verified or active merely by documenting it. Service-role credentials bypass RLS and belong only in a trusted server environment if one is introduced later.

## 4. Local history and cloud migration

Keep the current local-storage adapter working for signed-out and offline use. Do not delete, overwrite, or upload `cloudwise-az900.practice-history` automatically after sign-in. Local and cloud histories should be visibly identified as separate sources until a user chooses what to do.

Recommended future opt-in import (not implemented by the initial migration):

1. After sign-in, offer an explicit **Import this browser's practice history** action. Show a preview count and relevant date range from a successfully validated version-1 payload. If history is missing, corrupt, unsupported, or invalid, explain that it cannot be imported; do not reset it.
2. On explicit confirmation, import only completed attempts and their answer rows. Preserve original attempt IDs in `client_attempt_id`, original `completedAt`, session type/domain, question IDs, selected/correct option IDs, correctness, domain, and topic. Do not import incomplete in-memory sessions (none are currently saved).
3. Make the operation idempotent with unique `(user_id, client_attempt_id)` and report imported, already-present, and rejected records. Do not silently skip a failed record or report success before the transaction completes.
4. Keep local storage unchanged as a backup after import. Verify the cloud history count before offering any separately confirmed local deletion. Never merge local and cloud implicitly or double-count both sources in summaries.
5. Once the user opts into cloud history, treat that account's cloud records as its canonical signed-in history; keep local-only mode available when signed out or when sync is declined/unavailable. Show the active source and sync failure state clearly.

The uniqueness key makes retries safe but does not decide conflict policy if a user later edits local history independently. Keep the first imported record for a given `(user_id, client_attempt_id)` and report the duplicate; do not overwrite cloud records silently. An export/backup path can be considered before migration ships, but is not required for the first integration.

The initial migration deliberately rejects direct insertion of completed attempts and its completion RPC uses the database timestamp. Therefore it cannot yet preserve the original timestamps of local completed attempts. Before shipping history import, add a separate narrowly scoped import RPC that validates a complete legacy attempt and its responses transactionally, accepts a bounded historical completion timestamp, enforces the authenticated owner and the `(user_id, client_attempt_id)` idempotency key, and never exposes a way to modify an existing completed row. Do not work around this with a service-role key or by weakening the normal RLS policies.

## 5. Environment and migrations

The `.env.example` file documents Vite environment variables:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
```

These `VITE_` values are compiled into client code and are public configuration, not secrets. RLS is mandatory. The Supabase service-role/secret key must never use a `VITE_` name or enter the frontend, repository, browser storage, or static build. No credentials or `.env` files were created for this proposal.

`.gitignore` now ignores `.env` and `.env.*`, with an exception for `.env.example`. Keep that example limited to the variable names and obvious placeholders; do not put real project values in it. Vite variables are public configuration. The Supabase service-role/secret key must never use a `VITE_` name or enter the frontend, repository, browser storage, or static build.

The initial version-controlled migration is `supabase/migrations/20261021090000_create_learning_progress.sql`. It defines tables, checks, foreign keys, indexes, grants, RLS policies, the insert-serialization trigger, and completion RPC. No Supabase CLI configuration or project has been created. After a project exists and the CLI is installed, the setup path is:

1. Run `supabase init` if the repo has not already been initialized; preserve the existing migration file.
2. Run `supabase start` and `supabase db reset` against the local stack to apply migrations from a clean database. Use `supabase status` to obtain local development URL/key values; do not copy local values into the repository.
3. Run migration and policy tests with two local Auth users. Include cross-user read/insert/delete attempts, wrong-owner payloads, writes after completion, duplicate question responses, too-few/too-many responses, domain mismatch, concurrent insert/completion, cascade deletion, and repeat completion.
4. After creating/configuring a hosted Supabase project, sign in with `supabase login`, link with `supabase link --project-ref <project-ref>`, inspect `supabase migration list`, and apply reviewed SQL with `supabase db push` only after confirming the target project. Never apply this migration to a production project as part of this preparation task.
5. Copy the project's URL and publishable key into an ignored local `.env` file only when frontend integration is separately authorized. Verify that no secret/service-role key is present in the Vite build.

The CLI, Docker, `psql`, Supabase project, credentials, and Auth users were not available/configured during this task, so this migration has not been applied or database-tested.

## 6. Integration sequence

1. Review schema decisions, history source-of-truth behavior, data retention/deletion expectations, and the client-trust limitation above.
2. Configure a Supabase project and local CLI workflow; add only the browser-safe URL/key in ignored local config.
3. Apply and review the SQL migration locally. Test constraints, cascades, ownership boundaries, completion transition, and duplicate behavior with two test users. Build a separate import RPC before offering local-history import.
4. Add the Supabase client module and auth repository. Implement explicit sign-in/sign-out/session restoration and clear loading/error/signed-out states; no auth token or service key should be hand-managed in UI code.
5. Add the cloud learning-progress repository behind the existing history contract. Keep the current local repository and unit tests. Decide whether cloud sessions resume; the current product discards unfinished sessions, so do not claim resume support unless it is implemented.
6. Integrate opt-in local import and account deletion/reset semantics, then add repository tests and browser tests for signed-in, signed-out, offline, RLS-denied, and migration retry states.
7. Deploy the static frontend with only public Supabase configuration. Verify policies against a real non-service authenticated client before enabling cloud persistence for users.

## 7. Decisions and risks to review before implementation

- **Question identity and content evolution:** keep numeric question IDs stable. Decide how a future question-bank version or retired question is represented before changing existing IDs/meanings; current stored responses do not snapshot full question text/options.
- **Partial attempts:** the schema can distinguish them, but the current app does not persist or resume them. Decide whether cloud `in_progress` rows should be created at session start or whether only completed records should be persisted; avoid creating drafts unless product behavior needs them.
- **History source of truth:** choose when a signed-in learner transitions from local-only to cloud history and how cloud reset affects multiple devices. The recommendation is explicit import and explicit, account-wide deletion confirmation.
- **Score trust:** frontend answer keys mean users can alter their own scores. This is acceptable for personal practice history but not for certification, ranking, or proctored claims.
- **RLS validation:** policies and RPC are implemented in the migration but remain unverified security until two-user database tests pass.
- **Local-history import:** the initial migration cannot preserve original local completion timestamps. Add and test a separate authenticated import RPC before exposing import UI.
- **Environment exposure:** `VITE_` values are public; only the publishable key belongs in frontend configuration. A service-role key must stay server-side.
- **Retention and privacy:** define account deletion, backup/retention, and privacy notice expectations before collecting persistent user-linked learning data.

## 8. Verification performed for this proposal

The repository's existing scripts are `npm test` (`node --test`) and `npm run build` (`vite build`); both passed for the current worktree (9 tests passed and the Vite build succeeded). `git diff --check` also passed. These checks cover the existing local app and whitespace only; they do not exercise PostgreSQL syntax or RLS. The migration has not been run because the Supabase CLI, `psql`, Docker, project, and credentials are unavailable. Database acceptance checks are listed above; do not describe the RLS as tested until those checks pass against a local or hosted Supabase database.
