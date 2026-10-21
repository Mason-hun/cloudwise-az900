# CloudWise Authentication UI and Supabase Integration Audit

**Audit date:** 2026-10-21
**Branch:** `feat/stitch-inspired-redesign`
**Scope:** Read-only source, test, build, and configuration-rule inspection. No account, email, password-reset, or production-data operation was performed.

## Summary

CloudWise has a reachable email/password authentication view. Login and registration are modes within the same view rather than separate routes. The UI calls the Supabase Auth SDK through a small repository and uses Vite's `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values. The client is configured to persist sessions, refresh tokens, and detect callback URLs. These facts establish source-level integration, not that the deployed or local project can authenticate successfully.

Guest study remains available. Quiz attempts continue to be written to `localStorage` under `cloudwise-az900.practice-history`; authentication does not migrate or replace them. Learning-progress tables/RPCs are not called by the frontend.

## Feature matrix

| Feature | Status | Evidence and limits |
|---|---|---|
| Reachable login UI | Implemented | Header `Sign in` control (`src/main.js:275–281`) opens the auth view; form submit calls the repository's `signInWithPassword` wrapper (`src/main.js:853–875`, `src/data/authRepository.js:21–23`). No route framework is used. |
| Registration UI | Implemented | `Create account` mode button is available from the same view (`src/main.js:166–208`). Submit calls `auth.signUp` with the current page as `emailRedirectTo` (`src/main.js:866–870`, `src/data/authRepository.js:13–19`). |
| Logout | Implemented | Authenticated header renders `Sign out`; handler calls `auth.signOut({ scope: 'local' })` (`src/main.js:275–278, 903–919`, `src/data/authRepository.js:25–27`). |
| Session restoration | Partially implemented | Supabase client enables `persistSession` and `autoRefreshToken`; app subscribes to auth-state events and consumes `INITIAL_SESSION` (`src/lib/supabaseClient.js:5–13`, `src/main.js:769–814`). No direct session read or live reload test was performed. |
| Forgot-password request | Implemented | Login view exposes `Forgot password?`; reset mode invokes `resetPasswordForEmail` (`src/main.js:206, 877–881`, `src/data/authRepository.js:29–31`). |
| Password-reset completion | Partially implemented | `PASSWORD_RECOVERY` opens the new-password mode and submits via `updateUser({ password })` (`src/main.js:769–784, 882–898`, `src/data/authRepository.js:33–35`). Callback redirect allow-list and a real recovery link were not verified. |
| Email-confirmation handling | Partially implemented | Registration distinguishes a response with a session from one without and gives a confirmation-oriented message (`src/data/authState.js:8–12`, `src/main.js:866–870`). No email was sent or received; exact project behavior is unverified. |
| Loading, validation, and request errors | Partially implemented | Native form validity is checked; the form disables while requests run; network and invalid-credential messages are mapped and other provider errors are displayed (`src/main.js:137–164, 825–865`). Validation is not covered through a DOM/UI test, and provider behavior is not live-verified. |
| Unconfigured/guest state | Implemented | Missing or rejected configuration leaves `supabase` null and presents a helpful notice; guest continuation is always rendered (`src/lib/supabaseConfig.js:16–64`, `src/lib/supabaseClient.js:5–14`, `src/main.js:166–218`). |
| Authenticated/unauthenticated indication | Implemented | Header shows a generic “Signed in” indicator and sign-out action, or sign-in/restoration state (`src/main.js:275–281`). It does not expose the user's email. |
| Supabase learning-history persistence | Missing | `completeSession()` saves via `savePracticeAttempt()` and `src/data/practiceHistory.js`; no app import calls the learning-progress tables or RPC. This is consistent with the declared scope of the auth slice. |
| Live Supabase Auth/RLS verification | Not verified | No safe live login or account flow was run. The tests use stubs and do not exercise a real Supabase project or database policies. |

## Implementation and data-flow findings

- `src/lib/supabaseConfig.js` reads only the two expected Vite variables, rejects missing/placeholders, requires HTTPS except local HTTP, and rejects recognizable secret/service-role key forms. `src/lib/supabaseClient.js` initializes `@supabase/supabase-js` only when that check succeeds. Vite client variables are public by design; the validation does not make a secret safe to place in a `VITE_*` variable.
- `src/data/authRepository.js` contains the Auth SDK calls. `src/data/authState.js` contains a small state reducer. `src/main.js` renders and handles the forms. Passwords are submitted to Supabase Auth and are not manually stored by CloudWise. Session persistence is delegated to the SDK.
- Registration without an immediate session is not treated as signed in; the UI tells the learner to confirm email if required. Login, reset-email request, update-password, and sign-out errors feed the UI state. Supabase can intentionally avoid revealing whether an address has an account; the reset success copy is generic.
- Sign-in is available from the dashboard/header and from the auth view. `Continue as guest` returns to the prior view. Existing quiz selection and local history continue independently of auth state. `src/data/practiceHistory.js` owns the existing versioned local history contract and latest-answer revision calculation.
- The current auth view is a single-page mode switch, not a separate URL/route. Password reset completion depends on Supabase redirect handling and project URL configuration. Source inspection alone cannot confirm that the Vercel URL or localhost origin is allow-listed in the project.

## Security and configuration

- No credential-bearing environment file was opened, and no credential value was printed or copied. `.env.local` exists, but its contents and variable names were deliberately not inspected; its values and correctness therefore remain unverified.
- `.gitignore` ignores `.env` and `.env.*` while re-including `.env.example`. `git check-ignore` confirmed `.env.local` is ignored and `.env.example` is not ignored. The example contains placeholder text only.
- Source uses the publishable-key variable, not a service-role variable. No hardcoded project credential or token was found in the inspected auth source. This does not prove the contents of ignored local files or Vercel environment settings are safe.
- No frontend code disables RLS. The migration/security documentation describes RLS, but this audit did not connect to the project or verify deployed database policies. Auth UI does not currently access those tables.
- No Vercel configuration file was found in the repository file search. Vercel project environment variables, Supabase Auth site URL/redirect allow-list, and deployed build configuration were not accessible for verification.

## Verification performed

### Source inspection

Inspected the current auth UI/event flow, Supabase configuration/client/repository/state modules, question and practice-history behavior, `.gitignore`, `.env.example`, package scripts, README, architecture/security docs, and migration source. The working branch is `feat/stitch-inspired-redesign`; substantial redesign/auth work and untracked design references were already present. No existing change was discarded or staged.

### Automated checks

- `npm.cmd test` — passed: 22 tests, 0 failures. Auth tests use stub clients and pure state/config functions; they do not prove Supabase service behavior.
- `npm.cmd run build` — passed: Vite production build completed.
- `git diff --check` — passed for tracked changes. A separate trailing-whitespace check of this new, untracked report also passed.

### Browser and live-project checks

Browser automation was unavailable in this environment, so no visual/UI interaction check was performed. No account was created, no email or password reset was sent, and no live Supabase Auth or RLS behavior was tested. A successful build is not evidence of live authentication.

## Prioritized implementation plan

1. **Verify deployment configuration and callback URLs.** In the Vercel project, confirm the two expected variables are set to the project URL and a publishable key, then confirm Supabase Auth's site URL and redirect allow-list include the deployed origin and local development origin. Do not expose values in logs or source.
2. **Run a controlled end-to-end Auth smoke test in a non-production/test account.** Exercise registration with the project's actual email-confirmation setting, sign-in, reload/session restoration, sign-out, invalid credentials, network failure, reset email, and password update. Use authorized test accounts and do not put tokens or recovery links in reports.
3. **Add UI-level coverage.** Current tests verify config parsing, repository delegation, and state transitions, not reachable form behavior, duplicate-submit prevention, focus/accessibility, or redirect handling. Add isolated DOM tests or browser tests only in the normal implementation task.
4. **Keep learning-history persistence separate.** When that slice begins, implement a repository against the already-reviewed RLS/RPC contract, retain guest history untouched, and require a clear opt-in before any import. Test ownership isolation against a real Supabase/PostgreSQL test project before relying on cloud records.

## Decision

The repository contains a complete source-level shell for email/password registration, login, logout, session restoration, and password recovery, and it is wired to Supabase Auth APIs. It is **not verified as a working live account experience**: deployment configuration, redirect allow-list, actual email-confirmation behavior, and all real Auth flows remain untested. Guest quiz and local history remain available by source design. The next highest-priority task is a controlled end-to-end Auth smoke test after confirming Vercel/Supabase environment and redirect configuration.

## Preflight update — 2026-10-21

This update traces redirect construction and auth-event handling before any live test. Environment files containing credentials were not opened; no Supabase or Vercel settings were changed.

### Configuration names and status

The client reads exactly:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

These names agree in `src/lib/supabaseConfig.js`, `.env.example`, the README's local setup, and the deployment documentation. `.env.example` contains placeholders only. The local `.env.local` file exists and is ignored by Git, but its names and values were not read, so its correctness cannot be confirmed. There is no repository `vercel.json`; `README.md` says to set the two public values as build-time environment variables. No Vercel dashboard settings were inspected.

`readSupabaseConfig()` treats missing, incomplete, placeholder, invalid-URL, and recognizable secret/service-role key inputs as unconfigured and provides a guest-safe notice. The UI does not claim success when no client exists: auth submit controls are disabled and guest practice remains usable. The key check recognizes publishable-key prefix or a legacy anon JWT role; it does not prove that a syntactically accepted key belongs to the URL or is active. An incorrect but prefix-shaped key can therefore initialize the client and fail later on an Auth request, where the UI shows the returned error. No source-level blank-screen path was identified for ordinary missing/invalid configuration. Actual local configuration remains unverified.

### Redirect behavior expected by the code

`getAuthRedirectUrl()` in `src/main.js` returns `window.location.origin + window.location.pathname` (without query string or fragment). The same value is passed as `emailRedirectTo` to `signUp()` and as `redirectTo` to `resetPasswordForEmail()`.

Expected examples from the documented deployment/local URLs:

- Local Vite: `http://localhost:5173/`
- Production: `https://cloudwise-az900.vercel.app/`

These are inferred from the actual URL-construction code plus the README and stated deployment URL, not observed from a live callback. The Supabase client sets `detectSessionInUrl: true`; the app expects Supabase to process the callback and emit `PASSWORD_RECOVERY` or normal session events. There are no client-side route paths for callbacks. Preview deployments use their own current origin, so they will not work unless the corresponding preview URL is allowed by Supabase.

### Auth event and UI consistency review

`initializeAuthentication()` subscribes to `onAuthStateChange`; the app starts in `restoring` only when configuration passed, shows “Checking account…”, and resolves on `INITIAL_SESSION`. `SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`, and `PASSWORD_RECOVERY` update state through `reduceAuthState()`. Recovery switches to the update-password view; logout uses local scope and handles both the SDK event and the resolved operation. The event handler avoids rerendering for an unchanged status except for initial/sign-in/sign-out events. No definite stale-state defect was found in this source trace.

Session restoration and recovery still depend on SDK callback behavior and a valid redirect response; neither was exercised with a browser or live project. Registration with an immediate session relies on the SDK's auth-state event to update the UI; registration without a session remains on the auth view with confirmation guidance. This event-dependent behavior should be included in the controlled smoke test.

### Human dashboard checklist

Before creating or using a test account, verify without copying values into source or reports:

1. **Vercel → Project → Settings → Environment Variables:** define `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the intended Production environment, and Preview/Development only if those deployments will be tested. Ensure the key is the publishable/legacy anon key, never a secret or service-role key. Trigger a fresh deployment after changing build-time values.
2. **Supabase → Authentication → URL Configuration:** set Site URL to `https://cloudwise-az900.vercel.app/` for production. Add the exact production root and `http://localhost:5173/` to allowed Redirect URLs. Add a narrowly scoped preview URL only if preview deployments are part of testing; avoid broad wildcard origins.
3. **Supabase → Authentication → Providers / email settings:** confirm email/password is enabled, determine whether email confirmation is enabled, and verify the project has a working email delivery setup and confirmation/reset templates. The app's confirmation copy depends on whether sign-up returns a session.
4. Keep the project URL/key values out of screenshots, terminal output, issue comments, and this report. The publishable key is intended for browser use but must still be paired with restrictive database RLS for data access.

### Preflight verification boundary

- `npm.cmd test` — passed: 22 tests, 0 failures. Auth tests use stubs/pure functions and do not contact Supabase.
- `npm.cmd run build` — passed: Vite production build completed. A build does not establish that the ignored local configuration is valid or that production Vercel variables are set.
- Source inspection confirms variable-name alignment and callback construction. No live Supabase request, browser flow, email delivery, session reload, or dashboard setting was tested.

**Recommended next step:** have an authorized operator complete the dashboard checklist, then run the smoke test against a dedicated test account/project: registration and confirmation (according to project setting), sign-in, reload, sign-out, invalid credentials, and password recovery/update. Do not use or alter production user data for this check.
