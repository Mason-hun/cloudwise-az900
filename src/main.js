
import './style.css';
import { questions } from './data/questions.js';

const app = document.querySelector('#app');

let currentQuestionIndex = 0;
let selectedAnswer = null;
let submitted = false;
let answers = [];
let showResults = false;

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

  const percentage = Math.round((score / questions.length) * 100);
  const performance = summarizePerformance(answers, questions);

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
      const question = questions.find(
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
    <header class="topbar">
      <a class="brand" href="#" aria-label="CloudWise home">
        <span class="brand-mark">C</span>
        <span>CloudWise <span class="brand-light">AZ-900</span></span>
      </a>
      <span class="unofficial-label">Independent exam prep</span>
    </header>

    <main class="quiz-layout">
      <section class="quiz-heading">
        <p class="eyebrow">AZURE FUNDAMENTALS · RESULTS</p>
        <h1>Practice complete.</h1>
        <p>Review your answers and strengthen your understanding.</p>
      </section>

      <section class="question-card">
        <p class="eyebrow">YOUR SCORE</p>
        <h2>${score} out of ${questions.length}</h2>
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
          This breakdown reflects this practice attempt only. It does not predict
          AZ-900 exam results.
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

  app.querySelector('#restart-quiz').addEventListener('click', () => {
    currentQuestionIndex = 0;
    selectedAnswer = null;
    submitted = false;
    answers = [];
    showResults = false;
    renderQuiz();
  });
}

function renderQuiz() {
  if (showResults) {
    renderResults();
    return;
  }

  const question = questions[currentQuestionIndex];

  const answerOptions = question.options
    .map(
      (option) => `
        <button
          class="answer-option ${selectedAnswer === option.id ? 'selected' : ''}"
          data-answer="${option.id}"
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
      <section class="feedback ${isCorrect ? 'correct' : 'incorrect'}" aria-live="polite">
        <h2>${isCorrect ? 'Correct!' : 'Not quite.'}</h2>
        <p>
          Correct answer:
          <strong>${correctOption.text}</strong>
        </p>
        <p>${question.explanation}</p>
      </section>
    `;
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="CloudWise home">
        <span class="brand-mark">C</span>
        <span>CloudWise <span class="brand-light">AZ-900</span></span>
      </a>
      <span class="unofficial-label">Independent exam prep</span>
    </header>

    <main class="quiz-layout">
      <a class="back-link" href="#">← Learning dashboard</a>

      <section class="quiz-heading">
        <p class="eyebrow">AZURE FUNDAMENTALS · PRACTICE</p>
        <h1>Test your cloud knowledge.</h1>
        <p>Build understanding, one question at a time.</p>
      </section>

      <section class="question-card">
        <div class="question-meta">
          <span class="domain-label">${question.domain}</span>
          <span>Question ${currentQuestionIndex + 1} of ${questions.length}</span>
        </div>

        <h2 class="question-text">${question.text}</h2>

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

  app.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      if (submitted) return;

      selectedAnswer = button.dataset.answer;
      renderQuiz();
    });
  });

  app.querySelector('#submit-answer').addEventListener('click', () => {
    if (selectedAnswer === null) return;

    if (!submitted) {
      const isCorrect = selectedAnswer === question.correctAnswer;

      answers.push({
        questionId: question.id,
        selectedAnswer,
        isCorrect,
      });

      submitted = true;
      renderQuiz();
      return;
    }

    if (isLastQuestion) {
      showResults = true;
    } else {
      currentQuestionIndex += 1;
      selectedAnswer = null;
      submitted = false;
    }

    renderQuiz();
  });
}

if (questions.length === 0) {
  app.innerHTML = '<main class="quiz-layout"><h1>No questions available</h1></main>';
} else {
  renderQuiz();
}
