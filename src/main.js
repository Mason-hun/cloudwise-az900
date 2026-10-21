
import './style.css';
import { createAccountRepository } from './data/accountRepository.js';
import { createAccountOperationLock, getAccountProfile, getAccountRequestError, isMissingAvatarObjectError, renderAccountIdentity, renderCompactAvatarContents, validateAvatarFile, validateDisplayName, validatePasswordChange } from './data/accountProfile.js';
import { createAuthRepository } from './data/authRepository.js';
import { createInitialAuthState, getRegistrationSuccessMessage, reduceAuthState } from './data/authState.js';
import { getActiveNavigationItem, rememberPracticeView, resolveFeatureDestination } from './data/navigation.js';
import { questions } from './data/questions.js';
import {
  clearPracticeHistory,
  createPracticeAttempt,
  getLatestMissedQuestions,
  loadPracticeHistory,
  savePracticeAttempt,
  summarizePracticeHistory,
} from './data/practiceHistory.js';
import { supabase, supabaseConfig } from './lib/supabaseClient.js';

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
let authState = createInitialAuthState(supabaseConfig.configured);
let authMode = 'login';
let authReturnView = 'dashboard';
const authRepository = supabase ? createAuthRepository(supabase) : null;
const accountRepository = supabase ? createAccountRepository(supabase) : null;
let authSubscription = null;
let authUser = null;
let lastPracticeView = 'selection';
let accountMessage = '';
let accountError = '';
let accountBusy = false;
let profileEditing = false;
const accountOperationLock = createAccountOperationLock();
let avatarFile = null;
let avatarPreviewUrl = '';
let avatarSavedUrl = '';
let avatarLoadUserId = '';
let avatarLoadSequence = 0;

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

function getAuthModeTitle() {
  if (authMode === 'register') return 'Create your account';
  if (authMode === 'reset') return 'Reset your password';
  if (authMode === 'update-password') return 'Choose a new password';
  return 'Welcome back';
}

function getAuthModeDescription() {
  if (authMode === 'register') return 'Create an account to prepare for account-based learning progress.';
  if (authMode === 'reset') return 'Enter your email and we’ll send a reset link if an account can receive one.';
  if (authMode === 'update-password') return 'Set a new password for your CloudWise account.';
  return 'Sign in to your CloudWise account. You can also keep studying as a guest.';
}

function updateAuthFeedback() {
  const feedback = app.querySelector('#auth-feedback');
  if (!feedback) return;

  const message = authState.error || authState.message;
  feedback.textContent = message;
  feedback.hidden = !message;
  feedback.classList.toggle('is-error', Boolean(authState.error));
  feedback.setAttribute('role', authState.error ? 'alert' : 'status');
}

function updateAuthFormBusyState() {
  const form = app.querySelector('#auth-form');
  if (!form) return;

  form.setAttribute('aria-busy', String(authState.busy));

  for (const control of form.querySelectorAll('input, button[type="submit"]')) {
    control.disabled = authState.busy || !supabaseConfig.configured || authState.status === 'restoring';
  }

  const submit = form.querySelector('[data-auth-submit]');
  if (submit) {
    submit.textContent = authState.busy ? 'Please wait…' : submit.dataset.idleLabel;
  }
}

function getAuthErrorMessage(error) {
  const message = String(error?.message ?? '');
  if (
    error?.name === 'AuthRetryableFetchError' ||
    /failed to fetch|network|fetch failed|timeout/i.test(message)
  ) {
    return 'Cloud accounts could not be reached. Check your connection and try again. Guest practice is still available.';
  }
  if (/invalid login credentials|invalid email or password|invalid credentials/i.test(message)) {
    return 'Email or password was not accepted. Check your details and try again.';
  }
  return message || 'The account request could not be completed. Please try again.';
}

function renderAuthScreen() {
  const isLoginOrRegister = ['login', 'register'].includes(authMode);
  const isUpdatePassword = authMode === 'update-password';
  const configNote = supabaseConfig.configured
    ? ''
    : `<p class="auth-config-note" role="note">${escapeHTML(supabaseConfig.message)}</p>`;

  app.innerHTML = `
    ${renderHeader()}
    <main class="auth-layout" aria-labelledby="auth-title">
      <button class="back-link auth-guest-link" data-auth-guest type="button">← Continue as guest</button>
      <section class="auth-card">
        <p class="eyebrow">CLOUDWISE ACCOUNT</p>
        <h1 id="auth-title" tabindex="-1">${getAuthModeTitle()}</h1>
        <p class="auth-description">${getAuthModeDescription()}</p>
        ${configNote}
        ${isLoginOrRegister ? `
          <div class="auth-mode-switch" aria-label="Account access options">
            <button class="auth-mode-button ${authMode === 'login' ? 'is-current' : ''}" data-auth-mode="login" type="button" aria-pressed="${authMode === 'login'}">Sign in</button>
            <button class="auth-mode-button ${authMode === 'register' ? 'is-current' : ''}" data-auth-mode="register" type="button" aria-pressed="${authMode === 'register'}">Create account</button>
          </div>
        ` : ''}
        <form id="auth-form" class="auth-form" novalidate>
          ${!isUpdatePassword ? `
            <label class="auth-field" for="auth-email">
              <span>Email address</span>
              <input id="auth-email" name="email" type="email" autocomplete="email" required inputmode="email" />
            </label>
          ` : ''}
          ${authMode === 'login' || authMode === 'register' || isUpdatePassword ? `
            <label class="auth-field" for="auth-password">
              <span>${isUpdatePassword ? 'New password' : 'Password'}</span>
              <input id="auth-password" name="password" type="password" autocomplete="${authMode === 'login' ? 'current-password' : 'new-password'}" required />
            </label>
          ` : ''}
          <button class="primary-button auth-submit" data-auth-submit data-idle-label="${authMode === 'register' ? 'Create account' : authMode === 'reset' ? 'Send reset link' : isUpdatePassword ? 'Update password' : 'Sign in'}" type="submit">
            ${authMode === 'register' ? 'Create account' : authMode === 'reset' ? 'Send reset link' : isUpdatePassword ? 'Update password' : 'Sign in'}
          </button>
        </form>
        <p id="auth-feedback" class="auth-feedback" aria-live="polite" hidden></p>
        ${authMode === 'login' ? '<button class="auth-text-button" data-auth-mode="reset" type="button">Forgot password?</button>' : ''}
        ${authMode === 'reset' ? '<button class="auth-text-button" data-auth-mode="login" type="button">Back to sign in</button>' : ''}
        ${isUpdatePassword ? '<button class="auth-text-button" data-auth-mode="login" type="button">Back to sign in</button>' : ''}
      </section>
      <p class="auth-guest-note">Guest practice and this browser’s saved history remain available without an account.</p>
    </main>
  `;

  updateAuthFeedback();
  updateAuthFormBusyState();
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

function renderHeader() {
  const activeItem = getActiveNavigationItem(view, authReturnView);
  const profile = getAccountProfile(authUser);
  const navItems = [
    ['dashboard', 'Dashboard', '⌂', 'Home'],
    ['practice', 'Practice Quizzes', '▤', 'Practice'],
    ['domain-review', 'Domain Review', '◫', 'Domains'],
    ['revision-notes', 'Revision Notes', '↻', 'Revise'],
    ['account', 'Account', '●', 'Account'],
  ];
  const accountControl = authState.status === 'authenticated'
    ? `<span class="sidebar-user-avatar" data-avatar-slot="sidebar" aria-hidden="true">${renderCompactAvatarContents(authUser, avatarSavedUrl, 'sidebar-user-avatar')}</span><span class="sidebar-user-copy"><strong>${escapeHTML(profile.name)}</strong><small>${escapeHTML(profile.email)}</small></span>`
    : authState.status === 'restoring'
      ? '<span class="sidebar-user-copy"><strong>Checking account…</strong><small>Restoring session</small></span>'
      : '<span class="sidebar-user-avatar" aria-hidden="true">↗</span><span class="sidebar-user-copy"><strong>Sign in</strong><small>Account access</small></span>';

  return `
    <aside class="app-sidebar" aria-label="CloudWise navigation">
      <button class="brand" data-nav="dashboard" type="button" aria-label="CloudWise dashboard">
        <span class="brand-mark">C</span>
        <span>CloudWise <span class="brand-light">AZ-900</span></span>
      </button>
      <span class="unofficial-label"><span class="unofficial-dot" aria-hidden="true"></span>Independent AZ-900 study companion</span>
      <nav class="main-nav" aria-label="Main navigation">
        ${navItems.map(([destination, label, icon, shortLabel]) => {
          const iconMarkup = destination === 'account' && authState.status === 'authenticated'
            ? `<span class="nav-icon nav-account-avatar" data-avatar-slot="nav" aria-hidden="true">${renderCompactAvatarContents(authUser, avatarSavedUrl, 'nav-account-avatar')}</span>`
            : destination === 'account'
              ? '<span class="nav-icon nav-default-account-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"></path></svg></span>'
              : `<span class="nav-icon" aria-hidden="true">${icon}</span>`;
          return `<button class="nav-link ${activeItem === destination ? 'is-current' : ''}" data-nav="${destination}" type="button" ${activeItem === destination ? 'aria-current="page"' : ''}>${iconMarkup}<span class="nav-label">${label}</span><span class="nav-short-label">${shortLabel}</span></button>`;
        }).join('')}
      </nav>
      <div class="sidebar-account-area">
        <p class="eyebrow">YOUR ACCOUNT</p>
        <button class="sidebar-account-link ${activeItem === 'account' ? 'is-current' : ''}" data-nav="account" type="button" ${activeItem === 'account' ? 'aria-current="page"' : ''}>
          ${accountControl}<span class="sidebar-account-arrow" aria-hidden="true">›</span>
        </button>
        ${authState.status === 'authenticated' && view !== 'account' ? `<button class="sidebar-signout" data-auth-signout type="button" ${authState.busy ? 'disabled' : ''}>Sign out</button>` : ''}
      </div>
    </aside>
  `;
}

function renderDomainCards({ selection = false } = {}) {
  const counts = getDomainCounts();

  return [...counts.entries()]
    .map(([domain, count], index) => `
      <article class="study-card">
        <div class="domain-card-heading">
          <span class="domain-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
          <p class="eyebrow">STUDY DOMAIN</p>
        </div>
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
      ${authState.error && authState.status === 'authenticated'
        ? `<p class="auth-session-notice is-error" role="alert">${escapeHTML(authState.error)}</p>`
        : authState.message && ['expired', 'authenticated'].includes(authState.status)
        ? `<p class="auth-session-notice" role="status">${escapeHTML(authState.message)}${authState.status === 'expired' ? ' <button class="auth-text-button" data-auth-open type="button">Sign in</button>' : ''}</p>`
        : ''}
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

      <section class="dashboard-support-grid" aria-label="Practice history and targeted revision">
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
      <button class="back-link" data-nav="dashboard" type="button">← Dashboard</button>
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

function renderDomainReview() {
  historyState = loadPracticeHistory();
  const summary = summarizePracticeHistory(historyState.attempts);
  const counts = getDomainCounts();
  const priorPerformance = new Map(summary.domains.map((item) => [item.domain, item]));
  const cards = [...counts.entries()].map(([domain, count]) => {
    const stats = priorPerformance.get(domain);
    return `<article class="review-domain-card"><div><p class="eyebrow">AZ-900 STUDY DOMAIN</p><h2>${escapeHTML(domain)}</h2><p>${escapeHTML(domainDescriptions[domain] ?? '')}</p></div>
      <div class="review-domain-history">${stats ? `<strong>${stats.correct} / ${stats.answered} correct</strong><span>Recorded in this browser's saved practice history</span>` : '<span>No saved attempts for this domain yet.</span>'}</div>
      <p class="review-question-count">${count} original practice questions</p><button class="primary-button" data-start-domain="${escapeHTML(domain)}" type="button">Practise this domain</button></article>`;
  }).join('');

  app.innerHTML = `${renderHeader()}<main class="feature-page dashboard-layout" aria-labelledby="domain-review-title">
    <section class="feature-page-heading"><p class="eyebrow">LEARN BY STUDY AREA</p><h1 id="domain-review-title" tabindex="-1">Domain review</h1><p>Choose a domain to practise its questions. History figures come only from completed sessions saved in this browser.</p></section>
    <div class="review-domain-grid">${cards}</div>
    <p class="disclaimer">This question bank is a learning aid and does not represent official AZ-900 domain weighting or exam readiness.</p>
  </main>`;
}

function renderRevisionNotes() {
  historyState = loadPracticeHistory();
  const canRead = ['missing', 'ok'].includes(historyState.status);
  const missed = canRead ? getLatestMissedQuestions(historyState.attempts, questions) : [];
  const noteItems = missed.map((question) => `<article class="revision-note-card"><p class="eyebrow">${escapeHTML(question.domain)} · ${escapeHTML(question.topic)}</p><h2>${escapeHTML(question.text)}</h2><p>${escapeHTML(question.explanation)}</p></article>`).join('');
  const emptyMessage = canRead
    ? 'No questions are currently due for targeted revision. Finish practice and this list will include questions whose latest answer was incorrect.'
    : escapeHTML(getHistoryMessage(historyState.status));

  app.innerHTML = `${renderHeader()}<main class="feature-page dashboard-layout" aria-labelledby="revision-notes-title">
    <section class="feature-page-heading"><p class="eyebrow">YOUR LATEST MISSED QUESTIONS</p><h1 id="revision-notes-title" tabindex="-1">Revision notes</h1><p>This list is calculated from this browser's saved history. A later correct answer removes a question.</p></section>
    ${missed.length ? `<div class="revision-notes-list">${noteItems}<button class="primary-button" data-start-revision type="button">Practise ${missed.length} missed ${missed.length === 1 ? 'question' : 'questions'}</button></div>` : `<section class="account-empty-state"><p>${emptyMessage}</p><button class="primary-button" data-nav="practice" type="button">Start practising</button></section>`}
  </main>`;
}

function renderAccountPage() {
  const profile = getAccountProfile(authUser);
  const pictureUrl = avatarPreviewUrl || avatarSavedUrl;
  const nameMarkup = profileEditing
    ? `<form id="profile-form" class="account-form account-name-form">
        <label class="auth-field" for="account-display-name"><span>Display name</span><input id="account-display-name" name="displayName" type="text" maxlength="80" value="${escapeHTML(profile.displayName)}" autocomplete="name" required aria-describedby="display-name-guidance" /></label>
        <p class="account-field-guidance" id="display-name-guidance">Use a name up to 80 characters. This is for display only.</p>
        <div class="account-form-actions"><button class="primary-button" type="submit" ${accountBusy ? 'disabled' : ''}>${accountBusy === 'profile' ? 'Saving…' : 'Save name'}</button><button class="secondary-button" data-cancel-name-edit type="button" ${accountBusy ? 'disabled' : ''}>Cancel</button></div>
      </form>`
    : '';
  const avatarFileName = avatarFile ? escapeHTML(avatarFile.name) : '';
  app.innerHTML = `${renderHeader()}<main class="feature-page dashboard-layout account-page" aria-labelledby="account-page-title">
    <section class="feature-page-heading"><p class="eyebrow">PROFILE AND SECURITY</p><h1 id="account-page-title" tabindex="-1">Account</h1><p>Manage the profile details and sign-in security for your CloudWise account.</p></section>
    <section class="account-profile-card" aria-labelledby="account-profile-title">
      <div class="account-profile-main"><div class="account-identity" id="account-identity">${renderAccountIdentity(authUser, pictureUrl, { showEdit: !profileEditing })}</div>${nameMarkup}</div>
      <div class="account-profile-actions">
        <input class="visually-hidden avatar-file-input" id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a profile photo" aria-describedby="avatar-guidance" ${accountBusy ? 'disabled' : ''} />
        <button class="secondary-button" data-choose-avatar type="button" ${accountBusy ? 'disabled' : ''}>${avatarFile ? 'Choose a different photo' : 'Change photo'}</button>
        <p id="avatar-guidance">JPG, PNG, or WebP · up to 2 MiB. Photo uploads require this project’s private avatar Storage bucket and policies to be configured.</p>
        <p class="avatar-selected-file" aria-live="polite">${avatarFile ? `Selected: <strong>${avatarFileName}</strong>` : 'No new photo selected.'}</p>
        <div class="account-form-actions"><button class="primary-button" data-upload-avatar type="button" ${!avatarFile || accountBusy ? 'disabled' : ''}>${accountBusy === 'avatar' ? 'Uploading…' : 'Save photo'}</button>${avatarFile ? '<button class="text-button" data-cancel-avatar type="button" ' + (accountBusy ? 'disabled' : '') + '>Cancel selection</button>' : ''}</div>
      </div>
    </section>
    <div class="account-settings-grid">
      <section class="account-settings-card" aria-labelledby="profile-settings-title">
        <h2 id="profile-settings-title">Profile details</h2>
        <p class="account-card-description">This email is linked to your account. Email changes are not available here.</p>
        <div id="profile-contact-form" class="account-form">
          <label class="auth-field" for="account-email"><span>Email address</span><input id="account-email" type="email" value="${escapeHTML(profile.email)}" readonly /></label>
        </div>
      </section>
      <section class="account-settings-card" aria-labelledby="password-settings-title">
        <h2 id="password-settings-title">Change password</h2>
        <p class="account-card-description">Set a new password while signed in. CloudWise does not ask for or store your current password.</p>
        <form id="password-form" class="account-form">
          <div class="auth-field password-field"><label for="new-password">New password</label><span class="password-input-row"><input id="new-password" name="password" type="password" autocomplete="new-password" minlength="8" required /><button class="password-visibility" data-toggle-password="new-password" type="button" aria-label="Show new password" aria-pressed="false">Show</button></span></div>
          <div class="auth-field password-field"><label for="confirm-password">Confirm new password</label><span class="password-input-row"><input id="confirm-password" name="confirmation" type="password" autocomplete="new-password" minlength="8" required /><button class="password-visibility" data-toggle-password="confirm-password" type="button" aria-label="Show password confirmation" aria-pressed="false">Show</button></span></div>
          <button class="primary-button" type="submit" ${accountBusy ? 'disabled' : ''}>${accountBusy === 'password' ? 'Updating…' : 'Update password'}</button>
        </form>
      </section>
    </div>
    <p id="account-feedback" class="account-feedback ${accountError ? 'is-error' : ''}" role="${accountError ? 'alert' : 'status'}" aria-live="polite" ${accountError || accountMessage ? '' : 'hidden'}>${escapeHTML(accountError || accountMessage)}</p>
    <section class="account-session-card"><div><h2>Learning history</h2><p>Practice history is still saved locally in this browser and is not synced to your account.</p></div><button class="danger-outline-button" data-auth-signout type="button" ${authState.busy || accountBusy ? 'disabled' : ''}>Sign out</button></section>
  </main>`;
  if (!avatarPreviewUrl && authUser?.id && avatarLoadUserId !== authUser.id) void loadSavedAvatar(authUser.id);
}

function setAccountFeedback(message, { error = false } = {}) {
  accountMessage = error ? '' : message;
  accountError = error ? message : '';
  const feedback = app.querySelector('#account-feedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.hidden = !message;
  feedback.classList.toggle('is-error', error);
  feedback.setAttribute('role', error ? 'alert' : 'status');
}

function updateAvatarConsumers() {
  if (!authUser) return;
  for (const slot of app.querySelectorAll('[data-avatar-slot]')) {
    const className = slot.dataset.avatarSlot === 'sidebar' ? 'sidebar-user-avatar' : 'nav-account-avatar';
    slot.innerHTML = renderCompactAvatarContents(authUser, avatarSavedUrl, className);
  }
  const identity = app.querySelector('#account-identity');
  if (identity) identity.innerHTML = renderAccountIdentity(authUser, avatarPreviewUrl || avatarSavedUrl, { showEdit: !profileEditing });
}

async function loadSavedAvatar(userId, { required = false } = {}) {
  if (!accountRepository) return { status: 'unavailable' };
  const request = ++avatarLoadSequence;
  avatarLoadUserId = userId;
  try {
    const { data, error } = await accountRepository.downloadAvatar();
    if (request !== avatarLoadSequence || authUser?.id !== userId) return { status: 'stale' };
    if (error) {
      if (isMissingAvatarObjectError(error)) return { status: 'missing' };
      const message = getAccountRequestError(error, { resource: 'avatar' });
      if (!required && view === 'account') setAccountFeedback(message, { error: true });
      return { status: 'error', message, error };
    }
    if (data) {
      if (avatarSavedUrl) URL.revokeObjectURL(avatarSavedUrl);
      avatarSavedUrl = URL.createObjectURL(data);
      updateAvatarConsumers();
      return { status: 'loaded' };
    }
    return { status: 'missing' };
  } catch (error) {
    const message = 'The saved profile photo could not be retrieved. Check your connection and try again.';
    if (request === avatarLoadSequence && view === 'account' && !required) setAccountFeedback(message, { error: true });
    return { status: 'error', message, error };
  }
}

function navigateToFeature(destination) {
  lastPracticeView = rememberPracticeView(view, lastPracticeView);
  if (destination === 'account' && authState.status !== 'authenticated') {
    view = 'account';
    openAuth('login');
    return;
  }
  view = resolveFeatureDestination(destination, lastPracticeView);
  if (view === 'account') {
    accountMessage = '';
    accountError = '';
  }
  renderApp({ transition: true });
  app.querySelector('main h1')?.focus();
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
      <button class="back-link" data-nav="dashboard" type="button">← Dashboard</button>
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
  const sessionScope = sessionType === 'revision'
    ? 'Targeted revision'
    : selectedDomain ?? 'All domains';

  const answerOptions = question.options
    .map(
      (option) => `
        <button
          class="answer-option ${selectedAnswer === option.id ? 'selected' : ''} ${submitted && option.id === question.correctAnswer ? 'correct-answer' : ''} ${submitted && selectedAnswer === option.id && selectedAnswer !== question.correctAnswer ? 'incorrect-selection' : ''}"
          data-answer="${option.id}"
          aria-pressed="${selectedAnswer === option.id}"
          type="button"
          ${submitted ? 'disabled' : ''}
        >
          <span class="option-letter">${option.id.toUpperCase()}</span>
          <span class="answer-text">${option.text}</span>
          ${submitted && option.id === question.correctAnswer ? '<span class="answer-status">Correct answer</span>' : ''}
          ${submitted && selectedAnswer === option.id && selectedAnswer !== question.correctAnswer ? '<span class="answer-status">Your answer</span>' : ''}
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
        <div class="feedback-outcome">
          <span class="feedback-icon" aria-hidden="true">${isCorrect ? '✓' : '!'}</span>
          <h2>${isCorrect ? 'Correct!' : 'Not quite.'}</h2>
        </div>
        <div class="feedback-answer">
          <h3>Correct answer</h3>
          <p>${correctOption.text}</p>
        </div>
        <div class="feedback-explanation">
          <h3>Explanation</h3>
          <p>${question.explanation}</p>
        </div>
      </section>
    `;
  }

  const isLastQuestion = currentQuestionIndex === sessionQuestions.length - 1;

  app.innerHTML = `
    ${renderHeader()}
    <main class="quiz-layout practice-quiz-layout">
      <button class="back-link" data-nav="dashboard" type="button">← Dashboard</button>

      <section class="quiz-heading">
        <p class="eyebrow">AZURE FUNDAMENTALS · ${sessionScope.toUpperCase()}</p>
        <h1>Practice question</h1>
        <p>Choose the best answer, then use the explanation to strengthen your understanding.</p>
      </section>

      <section class="quiz-progress-panel" aria-label="Question progress">
        <div class="quiz-progress-heading">
          <span class="domain-label">${sessionScope}</span>
          <strong>Question ${currentQuestionIndex + 1} of ${sessionQuestions.length}</strong>
        </div>
        <progress
          class="quiz-progress"
          value="${currentQuestionIndex + 1}"
          max="${sessionQuestions.length}"
          aria-label="Practice session progress"
        ></progress>
      </section>

      <div class="quiz-content-grid">
        <section class="question-card">
          <div class="question-meta">
            <span class="domain-label">${question.domain}</span>
            <span>Single answer</span>
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

        <aside class="quiz-session-card" aria-labelledby="session-details-title">
          <p class="eyebrow">CURRENT SESSION</p>
          <h2 id="session-details-title">Session details</h2>
          <dl class="session-details-list">
            <div><dt>Practice set</dt><dd>${sessionScope}</dd></div>
            <div><dt>Questions</dt><dd>${sessionQuestions.length}</dd></div>
            <div><dt>Format</dt><dd>Untimed practice</dd></div>
          </dl>
          <p class="session-guidance">Take your time with the scenario. After you check your answer, CloudWise will show the correct option and its explanation.</p>
        </aside>
      </div>

      <p class="disclaimer">
        CloudWise is an independent learning project and is not affiliated with
        or endorsed by Microsoft. Questions are original practice material.
      </p>
    </main>
  `;

}

function renderApp({ transition = false } = {}) {
  lastPracticeView = rememberPracticeView(view, lastPracticeView);
  if (view === 'dashboard') {
    renderDashboard();
  } else if (view === 'auth') {
    renderAuthScreen();
  } else if (view === 'selection') {
    renderSelection();
  } else if (view === 'domain-review') {
    renderDomainReview();
  } else if (view === 'revision-notes') {
    renderRevisionNotes();
  } else if (view === 'account') {
    renderAccountPage();
  } else if (view === 'quiz') {
    renderQuiz();
  } else if (view === 'results') {
    renderResults();
  }

  if (transition) {
    app.querySelector('main')?.classList.add('view-enter');
  }
}

function handleAuthEvent(event, session) {
  const previousStatus = authState.status;
  const previousUser = authUser;
  const nextUser = session?.user ?? null;
  if (previousUser?.id !== nextUser?.id) {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    if (avatarSavedUrl) URL.revokeObjectURL(avatarSavedUrl);
    avatarPreviewUrl = '';
    avatarSavedUrl = '';
    avatarFile = null;
    avatarLoadUserId = '';
    avatarLoadSequence += 1;
  }
  authUser = nextUser;
  authState = reduceAuthState(authState, {
    type: 'AUTH_EVENT',
    event,
    hasSession: Boolean(session),
  });

  if (event === 'PASSWORD_RECOVERY') {
    authMode = 'update-password';
    authReturnView = 'dashboard';
    view = 'auth';
    renderApp({ transition: true });
    app.querySelector('#auth-password')?.focus();
    return;
  }

  if (!session && event === 'SIGNED_OUT' && view === 'account') view = 'dashboard';

  if (
    session &&
    view === 'auth' &&
    authMode !== 'update-password' &&
    ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED'].includes(event)
  ) {
    view = authReturnView;
  }

  const identityChanged = previousUser?.email !== nextUser?.email ||
    previousUser?.user_metadata?.display_name !== nextUser?.user_metadata?.display_name;
  if (previousStatus !== authState.status || identityChanged || event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    renderApp();
  }
  if (nextUser?.id && (!avatarSavedUrl && (avatarLoadUserId !== nextUser.id || ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED'].includes(event)))) {
    void loadSavedAvatar(nextUser.id);
  }
}

function initializeAuthentication() {
  if (!authRepository) return;

  try {
    authSubscription = authRepository.onAuthStateChange((event, session) => {
      handleAuthEvent(event, session);
    });
  } catch {
    authState = reduceAuthState(authState, {
      type: 'INITIALIZATION_FAILED',
      message: 'Cloud accounts could not be initialized. Guest practice is still available.',
    });
    renderApp();
  }
}

function openAuth(mode = 'login') {
  authReturnView = view === 'auth' ? 'dashboard' : view;
  authMode = mode;
  view = 'auth';
  authState = reduceAuthState(authState, { type: 'CLEAR_NOTICE' });
  renderApp({ transition: true });
  app.querySelector('#auth-email, #auth-password')?.focus();
}

async function runAuthRequest(operation, successMessage = '') {
  if (!authRepository || authState.busy) return null;

  authState = reduceAuthState(authState, { type: 'REQUEST_STARTED' });
  updateAuthFormBusyState();
  updateAuthFeedback();

  try {
    const result = await operation();
    if (result?.error) throw result.error;
    authState = reduceAuthState(authState, {
      type: 'REQUEST_SUCCEEDED',
      message: typeof successMessage === 'function' ? successMessage(result) : successMessage,
    });
    updateAuthFormBusyState();
    updateAuthFeedback();
    return result;
  } catch (error) {
    authState = reduceAuthState(authState, {
      type: 'REQUEST_FAILED',
      message: getAuthErrorMessage(error),
    });
    updateAuthFormBusyState();
    updateAuthFeedback();
    return null;
  }
}

async function handleAuthFormSubmit(event) {
  const form = event.target.closest('#auth-form');
  if (!form || authState.busy) return;

  event.preventDefault();
  if (!form.reportValidity()) return;

  const fields = new FormData(form);
  const email = String(fields.get('email') ?? '').trim();
  const password = String(fields.get('password') ?? '');
  let result;

  if (authMode === 'register') {
    result = await runAuthRequest(
      () => authRepository.signUp(email, password, getAuthRedirectUrl()),
      (response) => getRegistrationSuccessMessage(Boolean(response?.data?.session)),
    );
  } else if (authMode === 'login') {
    result = await runAuthRequest(
      () => authRepository.signIn(email, password),
      'You are signed in.',
    );
    if (result?.data?.session) handleAuthEvent('SIGNED_IN', result.data.session);
  } else if (authMode === 'reset') {
    result = await runAuthRequest(
      () => authRepository.requestPasswordReset(email, getAuthRedirectUrl()),
      'If an account can receive a reset message at that address, an email will be sent. Follow its link to choose a new password.',
    );
  } else if (authMode === 'update-password') {
    result = await runAuthRequest(
      () => authRepository.updatePassword(password),
      'Your password has been updated.',
    );
    if (result) {
      authState = reduceAuthState(authState, {
        type: 'RECOVERY_FINISHED',
        message: 'Your password has been updated.',
      });
      authMode = 'login';
      view = authReturnView;
      renderApp({ transition: true });
      app.querySelector('#dashboard-title')?.focus();
    }
  }
}

function getAuthRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

async function signOutLocally() {
  if (!authRepository || authState.busy) return;

  authState = reduceAuthState(authState, { type: 'LOCAL_SIGN_OUT_STARTED' });
  renderApp();
  try {
    const { error } = await authRepository.signOut();
    if (error) throw error;
    handleAuthEvent('SIGNED_OUT', null);
  } catch (error) {
    authState = reduceAuthState(authState, {
      type: 'LOCAL_SIGN_OUT_FAILED',
      message: getAuthErrorMessage(error),
    });
    renderApp();
  }
}

function updateAccountBusyControls() {
  for (const control of app.querySelectorAll('#profile-form input, #profile-form button, #password-form input, #password-form button, #avatar-file, [data-upload-avatar], [data-choose-avatar], [data-cancel-avatar]')) {
    control.disabled = Boolean(accountBusy);
  }
  const profileSubmit = app.querySelector('#profile-form button[type="submit"]');
  const passwordSubmit = app.querySelector('#password-form button[type="submit"]');
  const avatarSubmit = app.querySelector('[data-upload-avatar]');
  if (profileSubmit) profileSubmit.textContent = accountBusy === 'profile' ? 'Saving…' : 'Save profile';
  if (passwordSubmit) passwordSubmit.textContent = accountBusy === 'password' ? 'Updating…' : 'Update password';
  if (avatarSubmit) {
    avatarSubmit.textContent = accountBusy === 'avatar' ? 'Uploading…' : 'Save photo';
    avatarSubmit.setAttribute('aria-busy', String(accountBusy === 'avatar'));
  }
}

async function handleAccountFormSubmit(event) {
  const form = event.target.closest('#profile-form, #password-form');
  if (!form || accountBusy || !accountRepository || authState.status !== 'authenticated') return;
  event.preventDefault();

  const fields = new FormData(form);
  if (form.id === 'password-form') {
    const password = String(fields.get('password') ?? '');
    const confirmation = String(fields.get('confirmation') ?? '');
    const validationMessage = validatePasswordChange(password, confirmation);
    if (validationMessage) {
      setAccountFeedback(validationMessage, { error: true });
      return;
    }
    accountBusy = 'password';
  } else {
    const displayName = String(fields.get('displayName') ?? '').trim();
    const validationMessage = validateDisplayName(displayName);
    if (validationMessage) {
      setAccountFeedback(validationMessage, { error: true });
      return;
    }
    accountBusy = 'profile';
  }
  if (!accountOperationLock.acquire()) return;

  accountMessage = '';
  accountError = '';
  updateAccountBusyControls();
  try {
    let result;
    if (form.id === 'password-form') {
      result = await accountRepository.updatePassword(String(fields.get('password')));
    } else {
      const displayName = String(fields.get('displayName') ?? '').trim();
      result = await accountRepository.updateDisplayName(displayName);
    }
    if (result?.error) throw result.error;

    if (form.id === 'password-form') {
      form.reset();
      setAccountFeedback('Your password was updated.');
    } else {
      authUser = result?.data?.user ?? {
        ...authUser,
        user_metadata: { ...(authUser?.user_metadata ?? {}), display_name: String(fields.get('displayName') ?? '').trim() },
      };
      profileEditing = false;
      setAccountFeedback('Your profile details were saved.');
      renderApp();
      app.querySelector('[data-edit-name]')?.focus();
    }
  } catch (error) {
    setAccountFeedback(getAccountRequestError(error), { error: true });
  } finally {
    accountBusy = false;
    accountOperationLock.release();
    updateAccountBusyControls();
    const activeButton = form.querySelector('button[type="submit"]');
    if (activeButton) activeButton.textContent = form.id === 'password-form' ? 'Update password' : 'Save profile';
  }
}

function handleAvatarSelection(event) {
  if (event.target.id !== 'avatar-file') return;
  const file = event.target.files?.[0] ?? null;
  if (!file) return;
  const validationMessage = validateAvatarFile(file);
  if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
  avatarPreviewUrl = '';
  avatarFile = validationMessage ? null : file;
  if (validationMessage) {
    event.target.value = '';
    setAccountFeedback(validationMessage, { error: true });
  } else {
    accountError = '';
    avatarPreviewUrl = URL.createObjectURL(file);
    setAccountFeedback('Image selected. Save it to update your private profile picture.');
  }
  const identity = app.querySelector('#account-identity');
  if (identity) identity.innerHTML = renderAccountIdentity(authUser, avatarPreviewUrl || avatarSavedUrl, { showEdit: !profileEditing });
  updateAvatarSelectionControls();
}

function updateAvatarSelectionControls() {
  const selected = app.querySelector('.avatar-selected-file');
  if (selected) selected.innerHTML = avatarFile
    ? `Selected: <strong>${escapeHTML(avatarFile.name)}</strong>`
    : 'No new photo selected.';
  const upload = app.querySelector('[data-upload-avatar]');
  if (upload) upload.disabled = !avatarFile || Boolean(accountBusy);
  const choose = app.querySelector('[data-choose-avatar]');
  if (choose) choose.textContent = avatarFile ? 'Choose a different photo' : 'Change photo';
  const cancel = app.querySelector('[data-cancel-avatar]');
  if (avatarFile && !cancel) {
    const actions = upload?.parentElement;
    if (actions) actions.insertAdjacentHTML('beforeend', `<button class="text-button" data-cancel-avatar type="button" ${accountBusy ? 'disabled' : ''}>Cancel selection</button>`);
  } else if (!avatarFile) {
    cancel?.remove();
  }
}

function cancelAvatarSelection() {
  if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
  avatarPreviewUrl = '';
  avatarFile = null;
  const input = app.querySelector('#avatar-file');
  if (input) input.value = '';
  const identity = app.querySelector('#account-identity');
  if (identity) identity.innerHTML = renderAccountIdentity(authUser, avatarSavedUrl, { showEdit: !profileEditing });
  updateAvatarSelectionControls();
  setAccountFeedback('Photo selection cancelled. Your saved profile picture was kept.');
}

async function uploadSelectedAvatar() {
  if (!avatarFile || accountBusy || !authUser?.id || !accountRepository || !accountOperationLock.acquire()) return;
  accountBusy = 'avatar';
  updateAccountBusyControls();
  setAccountFeedback('Uploading your private profile image…');
  try {
    const { error } = await accountRepository.uploadAvatar(avatarFile);
    if (error) throw error;
    avatarLoadUserId = '';
    const reload = await loadSavedAvatar(authUser.id, { required: true });
    if (reload.status !== 'loaded') {
      if (reload.error) throw reload.error;
      throw { code: 'AVATAR_RETRIEVAL_FAILED' };
    }
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    avatarPreviewUrl = '';
    avatarFile = null;
    const input = app.querySelector('#avatar-file');
    if (input) input.value = '';
    updateAvatarSelectionControls();
    setAccountFeedback('Your profile photo was uploaded and is now available.');
  } catch (error) {
    setAccountFeedback(getAccountRequestError(error, { resource: 'avatar' }), { error: true });
  } finally {
    accountBusy = false;
    accountOperationLock.release();
    updateAccountBusyControls();
    const uploadButton = app.querySelector('[data-upload-avatar]');
    if (uploadButton) {
      uploadButton.disabled = !avatarFile;
      uploadButton.textContent = 'Save photo';
    }
    updateAvatarSelectionControls();
  }
}

app.addEventListener('click', (event) => {
  const control = event.target.closest('button');
  if (!control) return;

  if (control.hasAttribute('data-auth-open')) {
    openAuth('login');
    return;
  }

  if (control.hasAttribute('data-nav')) {
    navigateToFeature(control.dataset.nav);
    return;
  }

  if (control.hasAttribute('data-auth-mode')) {
    authMode = control.dataset.authMode;
    authState = reduceAuthState(authState, { type: 'CLEAR_NOTICE' });
    renderApp();
    app.querySelector('#auth-email, #auth-password')?.focus();
    return;
  }

  if (control.hasAttribute('data-auth-guest')) {
    view = authReturnView === 'auth' || (authReturnView === 'account' && authState.status !== 'authenticated')
      ? 'dashboard'
      : authReturnView;
    renderApp({ transition: true });
    app.querySelector('main h1')?.focus();
    return;
  }

  if (control.hasAttribute('data-auth-signout')) {
    void signOutLocally();
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

  if (control.hasAttribute('data-upload-avatar')) {
    void uploadSelectedAvatar();
    return;
  }

  if (control.hasAttribute('data-choose-avatar')) {
    app.querySelector('#avatar-file')?.click();
    return;
  }

  if (control.hasAttribute('data-cancel-avatar')) {
    cancelAvatarSelection();
    return;
  }

  if (control.hasAttribute('data-edit-name')) {
    profileEditing = true;
    renderApp();
    app.querySelector('#account-display-name')?.focus();
    return;
  }

  if (control.hasAttribute('data-cancel-name-edit')) {
    profileEditing = false;
    accountError = '';
    accountMessage = '';
    renderApp();
    app.querySelector('[data-edit-name]')?.focus();
    return;
  }

  if (control.hasAttribute('data-toggle-password')) {
    const input = app.querySelector(`#${control.dataset.togglePassword}`);
    if (!input) return;
    const showing = input.type === 'password';
    input.type = showing ? 'text' : 'password';
    control.setAttribute('aria-pressed', String(showing));
    control.setAttribute('aria-label', `${showing ? 'Hide' : 'Show'} ${input.id === 'new-password' ? 'new password' : 'password confirmation'}`);
    control.textContent = showing ? 'Hide' : 'Show';
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

app.addEventListener('submit', (event) => {
  if (event.target.closest('#auth-form')) void handleAuthFormSubmit(event);
  else void handleAccountFormSubmit(event);
});

app.addEventListener('change', handleAvatarSelection);
app.addEventListener('error', (event) => {
  if (!event.target.matches?.('.account-avatar-image, .nav-account-avatar-image, .sidebar-user-avatar-image')) return;
  const failedSource = event.target.getAttribute('src');
  if (failedSource === avatarPreviewUrl) {
    URL.revokeObjectURL(avatarPreviewUrl);
    avatarPreviewUrl = '';
    avatarFile = null;
    const input = app.querySelector('#avatar-file');
    if (input) input.value = '';
  } else if (failedSource === avatarSavedUrl) {
    URL.revokeObjectURL(avatarSavedUrl);
    avatarSavedUrl = '';
  }
  updateAvatarConsumers();
  updateAvatarSelectionControls();
  setAccountFeedback('The profile photo could not be displayed. The saved photo or initials are shown instead; try the photo again or choose another file.', { error: true });
}, true);

if (!Array.isArray(questions) || questions.length === 0) {
  app.innerHTML = '<main class="quiz-layout"><h1>No questions available</h1></main>';
} else if (!hasValidQuestionBank(questions)) {
  app.innerHTML = '<main class="quiz-layout"><h1>Practice questions are unavailable</h1><p>Please try again later.</p></main>';
} else {
  renderApp({ transition: true });
  initializeAuthentication();
}
