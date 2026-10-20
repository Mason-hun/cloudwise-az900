export const HISTORY_STORAGE_KEY = 'cloudwise-az900.practice-history';
export const HISTORY_VERSION = 1;

function resolveStorage(storage) {
  if (storage !== undefined) return storage;

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidAttempt(attempt) {
  if (
    !attempt ||
    !isNonEmptyString(attempt.id) ||
    !isNonEmptyString(attempt.completedAt) ||
    !Number.isFinite(Date.parse(attempt.completedAt)) ||
    !['all', 'domain', 'revision'].includes(attempt.type) ||
    !Number.isInteger(attempt.questionCount) ||
    attempt.questionCount < 1 ||
    !Number.isInteger(attempt.score) ||
    attempt.score < 0 ||
    attempt.score > attempt.questionCount ||
    !Array.isArray(attempt.answers) ||
    attempt.answers.length !== attempt.questionCount
  ) {
    return false;
  }

  if (attempt.type === 'domain' && !isNonEmptyString(attempt.domain)) {
    return false;
  }

  if (attempt.type !== 'domain' && attempt.domain !== null) {
    return false;
  }

  const questionIds = new Set();
  let correctCount = 0;

  for (const answer of attempt.answers) {
    if (
      !answer ||
      !['string', 'number'].includes(typeof answer.questionId) ||
      (typeof answer.questionId === 'string' && !answer.questionId.trim()) ||
      (typeof answer.questionId === 'number' && !Number.isFinite(answer.questionId)) ||
      !isNonEmptyString(answer.selectedAnswer) ||
      !isNonEmptyString(answer.correctAnswer) ||
      typeof answer.isCorrect !== 'boolean' ||
      !isNonEmptyString(answer.domain) ||
      !isNonEmptyString(answer.topic) ||
      questionIds.has(answer.questionId)
    ) {
      return false;
    }

    questionIds.add(answer.questionId);
    if ((answer.selectedAnswer === answer.correctAnswer) !== answer.isCorrect) {
      return false;
    }
    if (answer.isCorrect) correctCount += 1;
  }

  return correctCount === attempt.score &&
    (attempt.type !== 'domain' || attempt.answers.every((answer) => answer.domain === attempt.domain));
}

function isValidPayload(payload) {
  if (
    !payload ||
    payload.version !== HISTORY_VERSION ||
    !Array.isArray(payload.attempts)
  ) {
    return false;
  }

  const attemptIds = new Set();

  return payload.attempts.every((attempt) => {
    if (!isValidAttempt(attempt) || attemptIds.has(attempt.id)) return false;
    attemptIds.add(attempt.id);
    return true;
  });
}

export function loadPracticeHistory(storage) {
  const store = resolveStorage(storage);
  if (!store) return { attempts: [], status: 'unavailable' };

  let raw;
  try {
    raw = store.getItem(HISTORY_STORAGE_KEY);
  } catch {
    return { attempts: [], status: 'unavailable' };
  }

  if (raw === null) return { attempts: [], status: 'missing' };

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { attempts: [], status: 'corrupt' };
  }

  if (payload?.version !== HISTORY_VERSION) {
    return { attempts: [], status: 'unsupported' };
  }

  if (!isValidPayload(payload)) {
    return { attempts: [], status: 'invalid' };
  }

  return { attempts: payload.attempts, status: 'ok' };
}

export function createPracticeAttempt({
  type,
  domain = null,
  answers,
  sessionQuestions,
  completedAt = new Date().toISOString(),
  id,
}) {
  if (
    !Array.isArray(answers) ||
    !Array.isArray(sessionQuestions) ||
    sessionQuestions.length === 0 ||
    answers.length !== sessionQuestions.length
  ) {
    throw new TypeError('Only a fully completed practice session can be recorded.');
  }

  const questionById = new Map(sessionQuestions.map((question) => [question.id, question]));
  if (questionById.size !== sessionQuestions.length) {
    throw new TypeError('A completed session must contain unique question IDs.');
  }

  const answeredQuestionIds = new Set(answers.map((answer) => answer.questionId));
  if (
    answeredQuestionIds.size !== answers.length ||
    answers.some((answer) => !questionById.has(answer.questionId))
  ) {
    throw new TypeError('Every session question must have exactly one submitted answer.');
  }

  const storedAnswers = answers.map((answer) => {
    const question = questionById.get(answer.questionId);
    const isCorrect = answer.selectedAnswer === question.correctAnswer;
    if (isCorrect !== answer.isCorrect) {
      throw new TypeError('Submitted answer correctness does not match the question.');
    }

    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      domain: question.domain,
      topic: question.topic,
    };
  });

  let attemptId = id;
  if (!attemptId) {
    try {
      attemptId = globalThis.crypto?.randomUUID?.();
    } catch {
      attemptId = null;
    }
  }

  return {
    id: attemptId ?? `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    completedAt,
    type,
    domain,
    questionCount: storedAnswers.length,
    score: storedAnswers.filter((answer) => answer.isCorrect).length,
    answers: storedAnswers,
  };
}

export function savePracticeAttempt(attempt, storage) {
  if (!isValidAttempt(attempt)) return { saved: false, status: 'invalid-attempt' };

  const store = resolveStorage(storage);
  if (!store) return { saved: false, status: 'unavailable' };

  const history = loadPracticeHistory(store);
  if (!['missing', 'ok'].includes(history.status)) {
    return { saved: false, status: history.status };
  }

  if (history.attempts.some((savedAttempt) => savedAttempt.id === attempt.id)) {
    return { saved: false, status: 'duplicate' };
  }

  const payload = {
    version: HISTORY_VERSION,
    attempts: [...history.attempts, attempt],
  };

  try {
    store.setItem(HISTORY_STORAGE_KEY, JSON.stringify(payload));
    return { saved: true, status: 'saved' };
  } catch {
    return { saved: false, status: 'unavailable' };
  }
}

export function clearPracticeHistory(storage) {
  const store = resolveStorage(storage);
  if (!store) return { cleared: false, status: 'unavailable' };

  try {
    store.removeItem(HISTORY_STORAGE_KEY);
    return { cleared: true, status: 'cleared' };
  } catch {
    return { cleared: false, status: 'unavailable' };
  }
}

export function summarizePracticeHistory(attempts) {
  const domains = new Map();
  let totalCorrect = 0;
  let totalAnswered = 0;

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const summary = domains.get(answer.domain) ?? { domain: answer.domain, correct: 0, answered: 0 };
      summary.answered += 1;
      totalAnswered += 1;
      if (answer.isCorrect) {
        summary.correct += 1;
        totalCorrect += 1;
      }
      domains.set(answer.domain, summary);
    }
  }

  return {
    completedSessions: attempts.length,
    latestAttempt: attempts.at(-1) ?? null,
    totalCorrect,
    totalAnswered,
    domains: [...domains.values()],
  };
}

export function getLatestMissedQuestions(attempts, questionBank) {
  const latestAnswerByQuestion = new Map();

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      latestAnswerByQuestion.set(answer.questionId, answer);
    }
  }

  const questionsById = new Map(questionBank.map((question) => [question.id, question]));
  const seenIds = new Set();
  const missedQuestions = [];

  for (const [questionId, answer] of latestAnswerByQuestion) {
    const question = questionsById.get(questionId);
    if (!answer.isCorrect && question && !seenIds.has(questionId)) {
      seenIds.add(questionId);
      missedQuestions.push(question);
    }
  }

  return missedQuestions;
}
