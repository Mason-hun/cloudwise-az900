# CloudWise AZ-900

CloudWise is an independent, unofficial practice app for learners preparing for Microsoft Azure Fundamentals (AZ-900). It helps learners practise cloud concepts, understand why answers are correct, review their performance, and revisit questions they most recently answered incorrectly.

**[Open the live demo](https://cloudwise-az900.vercel.app/)** · [View the source code](https://github.com/Mason-hun/cloudwise-az900)

CloudWise is not affiliated with or endorsed by Microsoft. It does not contain official or copied certification exam questions.

## The problem and solution

Preparing for a fundamentals certification involves more than checking whether an answer is right. Learners also need to understand the reasoning, identify topics they find difficult, and revisit mistakes.

CloudWise brings these steps into a simple practice loop: choose a study domain, answer questions and read explanations, review the completed session, then use targeted revision to revisit questions whose most recent recorded answer was incorrect.

## Features

- Thirty-six locally stored practice questions, organized by AZ-900 domain, topic, and study objective.
- Dashboard with question counts for each domain and the full bank.
- Domain-specific and all-question practice sessions.
- Completed-session history saved locally in the browser.
- Targeted revision of questions whose most recent recorded answer was incorrect.
- Immediate correct/incorrect feedback and an explanation after each answer.
- End-of-attempt score, answered-question domain breakdown, revision guidance, and answer review.
- Restartable quiz with no account or backend.
- Responsive layout and keyboard-operable answer controls.

## How it works

The app uses a small client-side architecture:

1. **Question bank:** Static question records live in `src/data/questions.js`.
2. **Practice session:** Browser-side application code presents questions, checks selected answers, and provides explanations.
3. **Results and revision:** Completed sessions produce a score, domain summary, answer review, and a targeted revision list.
4. **Local history:** Completed attempts are saved in the browser's `localStorage`, allowing progress to persist in that browser.

There is no server-side application or account system in the current version. Practice history is local to the browser and is not synchronized across devices.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement).
- npm.

## Setup and usage

Clone the repository and install dependencies:

```sh
git clone https://github.com/Mason-hun/cloudwise-az900.git
cd cloudwise-az900
npm install
npm run dev
```

Open the local URL printed by Vite. Choose **Start practising** to select a domain or the full bank, or start a domain session from its dashboard card. Select one answer and choose **Check answer**. Read the feedback and explanation, then continue through the session. On the final question, choose **View results** to review your session score, domain summary, revision topics, and answers. Completed attempts are saved locally. **Try again** restarts the same selection with a clean attempt. Returning to the dashboard ends an unfinished attempt without saving it.

Create a production build with:

```sh
npm run build
```

Preview the built site locally with:

```sh
npm run preview
```

Run the automated tests with:

```sh
npm test
```

## Question content

Question records are in `src/data/questions.js`. Each record has a unique `id`, `domain`, `topic`, `objective`, `text`, an `options` array, a `correctAnswer` option ID, and an `explanation`. The app checks basic question and option fields before rendering, and `npm test` checks the bank's structure and domain counts.

The content is original practice material informed by the [official AZ-900 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900). The bank does not cover every study-guide objective or reproduce the exam's content or weighting. Scores and domain summaries describe only the questions attempted; they do not predict certification results. Review current Microsoft Learn materials when preparing for the exam.

## Limitations

- Practice history is stored in this browser's `localStorage`; it is not synced across devices or accounts and can be unavailable in restricted/private browsing contexts.
- The dashboard's domain figures count correct answers over all recorded answers for that domain. The most recent score is shown separately and reflects only the latest completed session.
- Targeted revision includes current-bank questions whose latest recorded answer was incorrect. A later correct answer removes that question from the revision list; revision attempts are saved like other completed sessions.
- Use **Reset saved practice history** on the dashboard and confirm the prompt to delete stored attempts from this browser. Clearing browser site data also removes this history.
- The question bank is static and has not been validated through formal learner research.
- The project is a learning prototype, not an official exam simulator.

## Deployment

The production output is the static `dist/` directory generated by `npm run build`. Deploy that directory to a static web host that serves `index.html` and its assets over HTTPS. Configure the host to serve the app entry for the root route. No server-side runtime or environment secrets are required by the current app.
