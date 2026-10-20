
import './style.css';

const question = {
  id: 1,
  domain: 'Cloud Concepts',
  text: 'A company needs to increase or decrease its cloud resources as demand changes. Which cloud benefit does this describe?',
  options: [
    { id: 'a', text: 'High availability' },
    { id: 'b', text: 'Scalability' },
    { id: 'c', text: 'Disaster recovery' },
    { id: 'd', text: 'Fault tolerance' },
  ],
  correctAnswer: 'b',
  explanation:
    'Scalability is the ability to increase or decrease resources to meet changing demand. High availability focuses on keeping services accessible, disaster recovery focuses on restoring services after a disruptive event, and fault tolerance focuses on continuing operation when components fail.',
};

const app = document.querySelector('#app');

let selectedAnswer = null;
let submitted = false;

function renderQuiz() {
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

    feedback = `
      <section class="feedback ${isCorrect ? 'correct' : 'incorrect'}" aria-live="polite">
        <h2>${isCorrect ? 'Correct!' : 'Not quite.'}</h2>
        <p>
          Correct answer:
          <strong>
            ${question.options.find(
              (option) => option.id === question.correctAnswer,
            ).text}
          </strong>
        </p>
        <p>${question.explanation}</p>
      </section>
    `;
  }

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
          <span>Question 1 of 1</span>
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
            ${selectedAnswer === null || submitted ? 'disabled' : ''}
          >
            ${submitted ? 'Answer submitted' : 'Check answer'}
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
    if (selectedAnswer === null || submitted) return;

    submitted = true;
    renderQuiz();
  });
}

renderQuiz();
