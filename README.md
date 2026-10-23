# CloudWise AZ-900

CloudWise is an independent, unofficial practice app for learners preparing for Microsoft Azure Fundamentals (AZ-900). Practise cloud concepts, understand why answers are correct, review performance, and revisit questions you most recently answered incorrectly.

**[Try the live demo](https://cloudwise-az900.vercel.app/)** · **[View the source code](https://github.com/Mason-hun/cloudwise-az900)**

> CloudWise is not affiliated with or endorsed by Microsoft. It does not contain official or copied certification exam questions.

## The problem and solution

Preparing for a fundamentals certification involves more than checking whether an answer is right. Learners also need to understand the reasoning, identify topics they find difficult, and revisit mistakes.

CloudWise turns this into a practice loop: choose a study domain, answer questions and read explanations, review the completed session, then use targeted revision to revisit questions whose most recent recorded answer was incorrect.

## Features

- 36 original practice questions organized by AZ-900 domain, topic, and study objective.
- Dashboard with question counts for each domain and the full question bank.
- Domain-specific and full-bank practice sessions.
- Immediate correct/incorrect feedback with an explanation after each answer.
- End-of-session score, domain breakdown, revision guidance, and answer-by-answer review.
- Practice history stored locally in the browser.
- Targeted revision for questions whose most recent recorded answer was incorrect.
- Guest practice without an account, with optional Supabase Auth accounts.
- Responsive layout and keyboard-operable answer controls.

## How it works

CloudWise uses a lightweight, client-side architecture:

1. **Question bank:** Static question records live in `src/data/questions.js`.
2. **Practice session:** Browser-side application code presents questions, checks selected answers, and provides explanations.
3. **Results and revision:** Completed sessions produce a score, domain summary, answer review, and targeted revision list.
4. **Local history:** Completed attempts are saved in the browser's `localStorage`, allowing practice history to persist in that browser.
5. **Account access:** Supabase Auth supports optional registration, email/password sign-in, session restoration, sign-out, and password recovery.

There is no CloudWise server-side application. In this release, Supabase is used for authentication; practice history is not uploaded on sign-in or synchronized across devices. Guest and signed-in learning histories remain separate.

## Try CloudWise

1. Open the [live demo](https://cloudwise-az900.vercel.app/) or run the app locally using the setup steps below.
2. Choose **Start practising** to select a domain or the full question bank, or start a session from a domain card on the dashboard.
3. Select an answer and choose **Check answer**. Read the feedback and explanation, then continue through the session.
4. On the last question, choose **View results** to review your score, domain summary, revision topics, and answers.
5. Return to the dashboard to access saved history and targeted revision.

Completed attempts are saved locally. **Try again** restarts the same selection as a fresh attempt. Returning to the dashboard ends an unfinished attempt without saving it.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8).
- npm.

## Local setup

Clone the repository and install dependencies:

```sh
git clone https://github.com/Mason-hun/cloudwise-az900.git
cd cloudwise-az900
npm install
npm run dev
```

Open the local URL printed by Vite.

### Optional Supabase Auth configuration

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and **publishable** key from your project settings.
3. Restart the Vite development server after changing the file.

The `VITE_` values are included in the browser build. **Never put a database password, secret key, or service-role key in them.** If the configuration is missing, guest practice remains available and the account screen explains the configuration issue.

In Supabase Auth settings, configure the local app URL (typically `http://localhost:5173/`) and production URL as allowed redirect URLs. Configure email confirmation and an appropriate email provider for the intended registration flow. With email confirmation enabled, registration does not sign the learner in until the address is confirmed. Password recovery returns the learner to the app to set a new password.

Signing in does not import or delete browser history. Cloud learning-history persistence and opt-in history import are not part of this release.

## Tests and production build

Run the automated tests:

```sh
npm test
```

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Question content and study scope

Question records are in `src/data/questions.js`. Each record has a unique `id`, `domain`, `topic`, `objective`, `text`, an `options` array, a `correctAnswer` option ID, and an `explanation`. The app checks basic question and option fields before rendering, and `npm test` checks the bank's structure and domain counts.

The questions are original practice material informed by the [official AZ-900 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900). The 36-question bank does not cover every study-guide objective or reproduce the exam's content or weighting. Scores and domain summaries describe only the questions attempted; they do not predict certification results. Use current Microsoft Learn materials alongside this tool when preparing for the exam.

## Limitations

- Practice history is stored in this browser's `localStorage`; it is not synced across devices or accounts and may be unavailable in restricted or private browsing contexts.
- Dashboard domain figures count correct answers over all recorded answers for that domain. The most recent score is shown separately and reflects only the latest completed session.
- Targeted revision includes current-bank questions whose latest recorded answer was incorrect. A later correct answer removes that question from the revision list. Revision attempts are saved like other completed sessions.
- To delete attempts stored in this browser, use **Reset saved practice history** on the dashboard and confirm the prompt. Clearing the browser's site data also removes this history.
- The question bank is static and has not been validated through formal learner research.
- CloudWise is a learning prototype, not an official exam simulator.

## Deployment

The production output is the static `dist/` directory generated by `npm run build`. Deploy it to a static web host that serves `index.html` and its assets over HTTPS. Configure the host to provide the Supabase URL and publishable key as build-time environment variables, and add the production URL to Supabase Auth's allowed redirect URLs. No CloudWise server-side runtime or secret key is required by the browser app.
