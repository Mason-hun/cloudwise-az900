
import './style.css';
import { questions } from './data/questions.js';
import {
  clearPracticeHistory,
  createPracticeAttempt,
  getLatestMissedQuestions,
  loadPracticeHistory,
  savePracticeAttempt,
  summarizePracticeHistory,
} from './data/practiceHistory.js';

const app = document.querySelector('#app');

function hasValidQuestionBank(questionBank) {
  if (!Array.isArray(questionBank) || questionBank.length === 0) return false;

  const questionIds = new Set();

  return questionBank.every((question) => {
    if (
      !question ||
      !['id', 'domain', 'topic', 'text', 'explanation'].every((key) =>
        String(question[key] ?? '').trim(),
      ) ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      questionIds.has(question.id)
    ) {
      return false;
    }

    questionIds.add(question.id);
    const optionIds = new Set();
    const optionsAreValid = question.options.every((option) => {
      if (
        !option ||
        !String(option.id ?? '').trim() ||
        !String(option.text ?? '').trim() ||
        optionIds.has(option.id)
      ) {
        return false;
      }

      optionIds.add(option.id);
      return true;
    });

    return optionsAreValid && optionIds.has(question.correctAnswer);
  });
}

let currentQuestionIndex = 0;
let selectedAnswer = null;
let submitted = false;
let answers = [];
let view = 'dashboard';
let selectedDomain = null;
let sessionQuestions = [];
let sessionType = 'all';
let historyState = loadPracticeHistory();
let saveStatus = 'saved';

const domainDescriptions = {
  'Cloud Concepts': 'Cloud models, service types, and the benefits of cloud computing.',
  'Azure Architecture and Services': 'Azure infrastructure, compute, networking, storage, and security.',
  'Azure Management and Governance': 'Cost management, governance, deployment, and monitoring tools.',
};

function getDomainCounts() {
  const counts = new Map();

  for (const question of questions) {
    counts.set(question.domain, (counts.get(question.domain) ?? 0) + 1);
  }

  return counts;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function getHistoryMessage(status) {
  if (status === 'unavailable') return 'Browser storage is unavailable. Completed sessions cannot be saved right now.';
  if (status === 'corrupt' || status === 'invalid') return 'Saved history could not be read. Reset it to start a fresh history.';
  if (status === 'unsupported') return 'Saved history uses a newer format. Reset it to use this version of CloudWise.';
  return '';
}

function getAttemptTypeLabel(attempt) {
  if (attempt.type === 'revision') return 'Targeted revision';
  if (attempt.type === 'domain') return `${attempt.domain} practice`;
  return 'All-domain practice';
}

function completeSession() {
  if (answers.length !== sessionQuestions.length || sessionQuestions.length === 0) {
    return false;
  }

  const attempt = createPracticeAttempt({
    type: sessionType,
    domain: selectedDomain,
    answers,
    sessionQuestions,
  });
  const result = savePracticeAttempt(attempt);
  saveStatus = result.status;
  historyState = loadPracticeHistory();
  view = 'results';
  renderApp({ transition: true });
  app.querySelector('#results-title')?.focus();
  return true;
}

function startSession({ type = 'all', domain = null, questionsForSession = null } = {}) {
  selectedDomain = domain;
  sessionType = type;
  historyState = loadPracticeHistory();
  sessionQuestions = questionsForSession
    ? [...questionsForSession]
    : type === 'revision'
      ? getLatestMissedQuestions(historyState.attempts, questions)
      : domain
        ? questions.filter((question) => question.domain === domain)
        : [...questions];
  if (sessionQuestions.length === 0) return false;
  currentQuestionIndex = 0;
  selectedAnswer = null;
  submitted = false;
  answers = [];
  saveStatus = 'saved';
  view = 'quiz';
  renderApp({ transition: true });
  app.querySelector('#question-text')?.focus();
  return true;
}

function returnToDashboard() {
  selectedDomain = null;
  sessionQuestions = [];
  currentQuestionIndex = 0;
  selectedAnswer = null;
  submitted = false;
  answers = [];
  sessionType = 'all';
  historyState = loadPracticeHistory();
  view = 'dashboard';
  renderApp({ transition: true });
  app.querySelector('#dashboard-title')?.focus();
}

function renderHeader() {
  return `
    <header class="topbar">
      <button class="brand" data-dashboard type="button" aria-label="CloudWise dashboard">
        <span class="brand-mark">C</span>
        <span>CloudWise <span class="brand-light">AZ-900</span></span>
      </button>
      <span class="unofficial-label">Independent exam prep</span>
    </header>
  `;
}

function renderDomainCards({ selection = false } = {}) {
  const counts = getDomainCounts();

  return [...counts.entries()]
    .map(([domain, count]) => `
      <article class="study-card">
        <p class="eyebrow">STUDY DOMAIN</p>
        <h3>${domain}</h3>
        <p>${domainDescriptions[domain] ?? 'Practise original questions for this AZ-900 domain.'}</p>
        <p class="question-count">${count} ${count === 1 ? 'question' : 'questions'} available</p>
        <button
          class="${selection ? 'selection-button' : 'text-button'}"
          data-start-domain="${domain}"
          type="button"
        >
          ${selection ? 'Start this domain' : 'Practise domain'}
        </button>
      </article>
    `)
    .join('');
}

function renderDashboard() {
  historyState = loadPracticeHistory();
  const totalQuestions = questions.length;
  const historySummary = summarizePracticeHistory(historyState.attempts);
  const historyIsReadable = ['missing', 'ok'].includes(historyState.status);
  const revisionQuestions = historyIsReadable
    ? getLatestMissedQuestions(historyState.attempts, questions)
    : [];
  const latestAttempt = historySummary.latestAttempt;
  const domainHistory = historySummary.domains
    .map((domain) => `
      <div class="history-domain-row">
        <span>${escapeHTML(domain.domain)}</span>
        <strong>${domain.correct}/${domain.answered} correct</strong>
      </div>
    `)
    .join('');
  const historyMessage = getHistoryMessage(historyState.status);
  const canResetHistory = historyState.attempts.length > 0 ||
    ['corrupt', 'invalid', 'unsupported'].includes(historyState.status);

  app.innerHTML = `
    ${renderHeader()}
    <main class="dashboard-layout">
      <section class="dashboard-hero" aria-labelledby="dashboard-title">
        <p class="eyebrow">AZURE FUNDAMENTALS · STUDY SPACE</p>
        <h1 id="dashboard-title" tabindex="-1">Build your Azure fundamentals, one question at a time.</h1>
        <p>Practise with original questions, understand each answer, and review the topics you missed.</p>
        <div class="hero-actions">
          <button class="primary-button" data-open-selection type="button">Start practising</button>
          <span>${totalQuestions} original practice questions available</span>
        </div>
      </section>

      <section class="study-section" aria-labelledby="domains-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">CHOOSE A STUDY AREA</p>
            <h2 id="domains-title">Practise by domain</h2>
          </div>
          <button class="text-button" data-start-all type="button">Practise all ${totalQuestions} questions →</button>
        </div>
        <div class="study-grid">${renderDomainCards()}</div>
      </section>

      <section class="activity-note" aria-labelledby="activity-title">
        <div class="activity-icon" aria-hidden="true">↗</div>
        <div>
          <h2 id="activity-title">Your practice activity</h2>
          ${historyIsReadable && historySummary.completedSessions > 0 ? `
            <p><strong>${historySummary.completedSessions}</strong> completed ${historySummary.completedSessions === 1 ? 'session' : 'sessions'} saved in this browser.</p>
            <p>${latestAttempt.score}/${latestAttempt.questionCount} correct on the most recent attempt: ${escapeHTML(getAttemptTypeLabel(latestAttempt))} · ${new Date(latestAttempt.completedAt).toLocaleString()}</p>
            ${domainHistory ? `<h3>Cumulative domain performance</h3><div class="history-domain-list">${domainHistory}</div>` : ''}
          ` : historyIsReadable ? `
            <p>No completed practice sessions saved yet. Finish a session to see your history here.</p>
          ` : `<p>${escapeHTML(historyMessage)}</p>`}
          ${historyMessage && historyIsReadable ? `<p class="storage-notice">${escapeHTML(historyMessage)}</p>` : ''}
        </div>
      </section>

      <section class="revision-entry" aria-labelledby="revision-title">
        <div>
          <p class="eyebrow">REVIEW WHAT YOU MISSED</p>
          <h2 id="revision-title">Targeted revision</h2>
          <p>${historyIsReadable
            ? revisionQuestions.length
              ? `${revisionQuestions.length} question${revisionQuestions.length === 1 ? '' : 's'} were answered incorrectly most recently. A later correct answer removes that question from this list.`
              : historySummary.completedSessions
                ? 'No questions are currently marked for revision. Questions answered correctly on a later attempt are removed from this list.'
                : 'Complete a practice session to build a revision list from questions you missed.'
            : 'Revision needs readable saved practice history.'}</p>
        </div>
        ${historyIsReadable && revisionQuestions.length
          ? `<button class="primary-button" data-start-revision type="button">Revise ${revisionQuestions.length} missed question${revisionQuestions.length === 1 ? '' : 's'}</button>`
          : '<button class="primary-button" type="button" disabled>No questions to revise</button>'}
      </section>

      ${canResetHistory ? `
        <div class="history-actions">
          <button class="text-button danger-button" data-reset-history type="button">Reset saved practice history</button>
        </div>
      ` : ''}

      <p class="disclaimer">CloudWise is an independent learning project and is not affiliated with or endorsed by Microsoft. Questions are original practice material.</p>
    </main>
  `;
}

function renderSelection() {
  app.innerHTML = `
    ${renderHeader()}
    <main class="dashboard-layout selection-layout">
      <button class="back-link" data-dashboard type="button">← Dashboard</button>
      <section class="quiz-heading" aria-labelledby="selection-title">
        <p class="eyebrow">CHOOSE YOUR PRACTICE</p>
        <h1 id="selection-title" tabindex="-1">What would you like to study?</h1>
        <p>Each session uses only the questions shown for that selection.</p>
      </section>
      <section class="selection-grid" aria-label="Practice options">
        <article class="study-card all-questions-card">
          <p class="eyebrow">FULL PRACTICE SET</p>
          <h2>All AZ-900 domains</h2>
          <p>Mix questions from all three study domains in one session.</p>
          <p class="question-count">${questions.length} ${questions.length === 1 ? 'question' : 'questions'} available</p>
          <button class="primary-button" data-start-all type="button">Start all questions</button>
        </article>
        ${renderDomainCards({ selection: true })}
      </section>
      <p class="disclaimer">This small practice set does not cover every AZ-900 study objective or predict exam results.</p>
    </main>
  `;
}

function summarizePerformance(answerRecords, questionBank) {
  const questionsById = new Map(
    questionBank.map((question) => [question.id, question]),
  );

  const domains = [];
  const domainsByName = new Map();
  const missedTopics = [];
  const seenTopics = new Set();

  for (const answer of answerRecords) {
    const question = questionsById.get(answer.questionId);

    if (!question) {
      continue;
    }

    let domainSummary = domainsByName.get(question.domain);

    if (!domainSummary) {
      domainSummary = {
        domain: question.domain,
        correct: 0,
        attempted: 0,
      };
      domainsByName.set(question.domain, domainSummary);
      domains.push(domainSummary);
    }

    domainSummary.attempted += 1;

    if (answer.isCorrect) {
      domainSummary.correct += 1;
    } else if (question.topic && !seenTopics.has(question.topic)) {
      seenTopics.add(question.topic);
      missedTopics.push(question.topic);
    }
  }

  return { domains, missedTopics };
}

function renderResults() {
  const score = answers.filter(
    (answer) => answer.isCorrect,
  ).length;

  const percentage = Math.round((score / sessionQuestions.length) * 100);
  const performance = summarizePerformance(answers, sessionQuestions);

  const domainBreakdown = performance.domains
    .map((domainSummary) => {
      const domainPercent =
        domainSummary.attempted === 0
          ? 0
          : Math.round(
              (domainSummary.correct / domainSummary.attempted) * 100,
            );

      return `
        <article class="domain-stat">
          <span class="domain-label">${domainSummary.domain}</span>
          <span class="domain-stat-score">
            ${domainSummary.correct}/${domainSummary.attempted} correct (${domainPercent}%)
          </span>
        </article>
      `;
    })
    .join('');

  const revisionGuidance =
    performance.missedTopics.length === 0
      ? '<p>You answered every question in this attempt correctly. Review the explanations below to keep these topics fresh.</p>'
      : `
        <p>Revise these topics from this attempt:</p>
        <ul class="revision-list">
          ${performance.missedTopics.map((topic) => `<li>${topic}</li>`).join('')}
        </ul>
      `;

  const reviewItems = answers
    .map((answer, index) => {
      const question = sessionQuestions.find(
        (item) => item.id === answer.questionId,
      );

      return `
        <article class="feedback ${answer.isCorrect ? 'correct' : 'incorrect'}">
          <h3>Question ${index + 1}: ${answer.isCorrect ? 'Correct' : 'Incorrect'}</h3>
          <p>${question.text}</p>
          <p>
            Your answer:
            <strong>
              ${question.options.find(
                (option) => option.id === answer.selectedAnswer,
              )?.text ?? 'No answer'}
            </strong>
          </p>
          <p>
            Correct answer:
            <strong>
              ${question.options.find(
                (option) => option.id === question.correctAnswer,
              ).text}
            </strong>
          </p>
          <p>${question.explanation}</p>
        </article>
      `;
    })
    .join('');

  app.innerHTML = `
    ${renderHeader()}
    <main class="quiz-layout">
      <button class="back-link" data-dashboard type="button">← Dashboard</button>
      <section class="quiz-heading">
        <p class="eyebrow">AZURE FUNDAMENTALS · RESULTS · ${sessionType === 'revision' ? 'TARGETED REVISION' : selectedDomain ? selectedDomain.toUpperCase() : 'ALL DOMAINS'}</p>
        <h1 id="results-title" tabindex="-1">Practice complete.</h1>
        <p>Review your answers and strengthen your understanding.</p>
        <p class="storage-notice" role="status">${saveStatus === 'saved' ? 'This completed attempt was saved in this browser.' : 'This attempt is shown, but could not be saved in this browser.'}</p>
      </section>

      <section class="question-card">
        <p class="eyebrow">YOUR SCORE</p>
        <h2>${score} out of ${sessionQuestions.length}</h2>
        <p>${percentage}% correct</p>
        <p>
          ${
            percentage === 100
              ? 'Excellent work. Keep practising to reinforce your understanding.'
              : 'Review the explanations below, then try again to reinforce what you learned.'
          }
        </p>

        <button id="restart-quiz" class="primary-button" type="button">
          Try again
        </button>
      </section>

      <section class="results-breakdown">
        <p class="eyebrow">THIS ATTEMPT</p>
        <h2>Performance by domain</h2>
        <div class="domain-stat-list">
          ${domainBreakdown}
        </div>
        <h3>Revision guidance</h3>
        ${revisionGuidance}
        <p class="results-note">
          This breakdown reflects this practice attempt only. The small question
          bank does not mirror AZ-900 domain weighting or predict exam results.
        </p>
      </section>

      <section class="results-review">
        <h2>Answer review</h2>
        ${reviewItems}
      </section>

      <p class="disclaimer">
        CloudWise is an independent learning project and is not affiliated with
        or endorsed by Microsoft. Questions are original practice material.
      </p>
    </main>
  `;

}

function renderQuiz() {
  const question = sessionQuestions[currentQuestionIndex];

  const answerOptions = question.options
    .map(
      (option) => `
        <button
          class="answer-option ${selectedAnswer === option.id ? 'selected' : ''}"
          data-answer="${option.id}"
          aria-pressed="${selectedAnswer === option.id}"
          type="button"
          ${submitted ? 'disabled' : ''}
        >
          <span class="option-letter">${option.id.toUpperCase()}</span>
          <span>${option.text}</span>
        </button>
      `,
    )
    .join('');

  let feedback = '';

  if (submitted) {
    const isCorrect = selectedAnswer === question.correctAnswer;
    const correctOption = question.options.find(
      (option) => option.id === question.correctAnswer,
    );

    feedback = `
      <section class="feedback ${isCorrect ? 'correct' : 'incorrect'}" aria-live="polite" tabindex="-1">
        <h2>${isCorrect ? 'Correct!' : 'Not quite.'}</h2>
        <p>
          Correct answer:
          <strong>${correctOption.text}</strong>
        </p>
        <p>${question.explanation}</p>
      </section>
    `;
  }

  const isLastQuestion = currentQuestionIndex === sessionQuestions.length - 1;

  app.innerHTML = `
    ${renderHeader()}
    <main class="quiz-layout">
      <button class="back-link" data-dashboard type="button">← Dashboard</button>

      <section class="quiz-heading">
        <p class="eyebrow">AZURE FUNDAMENTALS · PRACTICE</p>
        <h1>Test your cloud knowledge.</h1>
        <p>Build understanding, one question at a time.</p>
      </section>

      <section class="question-card">
        <div class="question-meta">
          <span class="domain-label">${question.domain}</span>
          <span>Question ${currentQuestionIndex + 1} of ${sessionQuestions.length}</span>
        </div>

        <h2 id="question-text" class="question-text" tabindex="-1">${question.text}</h2>

        <div class="answer-list">
          ${answerOptions}
        </div>

        ${feedback}

        <div class="question-actions">
          <span class="selection-hint">
            ${submitted ? 'Answer submitted' : 'Select one answer'}
          </span>

          <button
            id="submit-answer"
            class="primary-button"
            type="button"
            ${selectedAnswer === null && !submitted ? 'disabled' : ''}
          >
            ${submitted ? (isLastQuestion ? 'View results' : 'Next question') : 'Check answer'}
          </button>
        </div>
      </section>

      <p class="disclaimer">
        CloudWise is an independent learning project and is not affiliated with
        or endorsed by Microsoft. Questions are original practice material.
      </p>
    </main>
  `;

}

function renderApp({ transition = false } = {}) {
  if (view === 'dashboard') {
    renderDashboard();
  } else if (view === 'selection') {
    renderSelection();
  } else if (view === 'quiz') {
    renderQuiz();
  } else if (view === 'results') {
    renderResults();
  }

  if (transition) {
    app.querySelector('main')?.classList.add('view-enter');
  }
}

app.addEventListener('click', (event) => {
  const control = event.target.closest('button');
  if (!control) return;

  if (control.hasAttribute('data-dashboard')) {
    returnToDashboard();
    return;
  }

  if (control.hasAttribute('data-open-selection')) {
    view = 'selection';
    renderApp({ transition: true });
    app.querySelector('#selection-title')?.focus();
    return;
  }

  if (control.hasAttribute('data-start-all')) {
    startSession({ type: 'all' });
    return;
  }

  if (control.hasAttribute('data-start-domain')) {
    startSession({ type: 'domain', domain: control.dataset.startDomain });
    return;
  }

  if (control.hasAttribute('data-start-revision')) {
    startSession({ type: 'revision' });
    return;
  }

  if (control.hasAttribute('data-reset-history')) {
    let confirmed = false;
    try {
      confirmed = globalThis.confirm('Delete all saved CloudWise practice history from this browser? This cannot be undone.');
    } catch {
      confirmed = false;
    }
    if (!confirmed) return;

    clearPracticeHistory();
    historyState = loadPracticeHistory();
    renderApp();
    app.querySelector('#dashboard-title')?.focus();
    return;
  }

  if (control.id === 'restart-quiz') {
    startSession({ type: sessionType, domain: selectedDomain, questionsForSession: sessionQuestions });
    return;
  }

  if (view !== 'quiz') return;

  if (control.hasAttribute('data-answer')) {
    if (submitted) return;
    selectedAnswer = control.dataset.answer;
    renderApp();
    app.querySelector(`[data-answer="${selectedAnswer}"]`)?.focus();
    return;
  }

  if (control.id !== 'submit-answer' || selectedAnswer === null) return;

  if (!submitted) {
    const question = sessionQuestions[currentQuestionIndex];
    answers.push({
      questionId: question.id,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
    });
    submitted = true;
    renderApp();
    app.querySelector('.feedback[aria-live]')?.focus();
    return;
  }

  if (currentQuestionIndex === sessionQuestions.length - 1) {
    completeSession();
  } else {
    currentQuestionIndex += 1;
    selectedAnswer = null;
    submitted = false;
    renderApp();
    app.querySelector('#question-text')?.focus();
  }
});

if (!Array.isArray(questions) || questions.length === 0) {
  app.innerHTML = '<main class="quiz-layout"><h1>No questions available</h1></main>';
} else if (!hasValidQuestionBank(questions)) {
  app.innerHTML = '<main class="quiz-layout"><h1>Practice questions are unavailable</h1><p>Please try again later.</p></main>';
} else {
  renderApp({ transition: true });
}
