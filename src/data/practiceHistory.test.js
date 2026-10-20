import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HISTORY_STORAGE_KEY,
  HISTORY_VERSION,
  clearPracticeHistory,
  createPracticeAttempt,
  getLatestMissedQuestions,
  loadPracticeHistory,
  savePracticeAttempt,
  summarizePracticeHistory,
} from './practiceHistory.js';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const questions = [
  {
    id: 1,
    domain: 'Cloud Concepts',
    topic: 'Scalability',
    options: [{ id: 'a', text: 'Yes' }, { id: 'b', text: 'No' }],
    correctAnswer: 'a',
  },
  {
    id: 2,
    domain: 'Azure Architecture and Services',
    topic: 'Resource Groups',
    options: [{ id: 'a', text: 'Yes' }, { id: 'b', text: 'No' }],
    correctAnswer: 'a',
  },
];

function attempt({ id, type = 'all', domain = null, questionId = 1, selectedAnswer = 'a' }) {
  const question = questions.find((entry) => entry.id === questionId);
  const answer = {
    questionId,
    selectedAnswer,
    isCorrect: selectedAnswer === question.correctAnswer,
  };

  return createPracticeAttempt({
    id,
    completedAt: '2026-10-21T10:00:00.000Z',
    type,
    domain,
    answers: [answer],
    sessionQuestions: [question],
  });
}

test('missing storage starts empty and inaccessible storage fails safely', () => {
  assert.deepEqual(loadPracticeHistory(new MemoryStorage()), {
    attempts: [],
    status: 'missing',
  });
  assert.equal(loadPracticeHistory(null).status, 'unavailable');
});

test('completed attempts are versioned, validated, loaded, and duplicate IDs are ignored', () => {
  const storage = new MemoryStorage();
  const record = attempt({ id: 'attempt-1' });

  assert.deepEqual(savePracticeAttempt(record, storage), {
    saved: true,
    status: 'saved',
  });
  assert.equal(JSON.parse(storage.getItem(HISTORY_STORAGE_KEY)).version, HISTORY_VERSION);
  assert.deepEqual(loadPracticeHistory(storage).attempts, [record]);
  assert.deepEqual(savePracticeAttempt(record, storage), {
    saved: false,
    status: 'duplicate',
  });
  assert.equal(loadPracticeHistory(storage).attempts.length, 1);
});

test('incomplete sessions cannot be converted into saved attempts', () => {
  assert.throws(
    () => createPracticeAttempt({
      type: 'all',
      answers: [],
      sessionQuestions: [questions[0]],
    }),
    /fully completed/,
  );
});

test('corrupt, unsupported, and semantically invalid history is rejected without overwriting it', () => {
  const storage = new MemoryStorage();
  storage.setItem(HISTORY_STORAGE_KEY, '{bad json');
  assert.equal(loadPracticeHistory(storage).status, 'corrupt');
  assert.equal(savePracticeAttempt(attempt({ id: 'new' }), storage).saved, false);
  assert.equal(storage.getItem(HISTORY_STORAGE_KEY), '{bad json');

  storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ version: 999, attempts: [] }));
  assert.equal(loadPracticeHistory(storage).status, 'unsupported');

  storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({
    version: HISTORY_VERSION,
    attempts: [{ ...attempt({ id: 'bad' }), score: 0 }],
  }));
  assert.equal(loadPracticeHistory(storage).status, 'invalid');
});

test('history summaries report completed sessions and cumulative domain answers', () => {
  const records = [
    attempt({ id: 'first', questionId: 1, selectedAnswer: 'b' }),
    attempt({ id: 'second', questionId: 2, selectedAnswer: 'a' }),
  ];

  const summary = summarizePracticeHistory(records);
  assert.equal(summary.completedSessions, 2);
  assert.equal(summary.latestAttempt.id, 'second');
  assert.equal(summary.totalCorrect, 1);
  assert.equal(summary.totalAnswered, 2);
  assert.deepEqual(summary.domains.map(({ domain, correct, answered }) => ({ domain, correct, answered })), [
    { domain: 'Cloud Concepts', correct: 0, answered: 1 },
    { domain: 'Azure Architecture and Services', correct: 1, answered: 1 },
  ]);
});

test('revision contains unique questions last answered incorrectly and removes later improvements', () => {
  const first = attempt({ id: 'first', questionId: 1, selectedAnswer: 'b' });
  const repeatedMiss = attempt({ id: 'repeat-miss', questionId: 1, selectedAnswer: 'b' });
  const improved = attempt({ id: 'improved', questionId: 1, selectedAnswer: 'a' });
  const otherMiss = attempt({ id: 'other', questionId: 2, selectedAnswer: 'b' });

  assert.deepEqual(getLatestMissedQuestions([first, repeatedMiss], questions).map((q) => q.id), [1]);
  assert.deepEqual(getLatestMissedQuestions([first, improved], questions), []);
  assert.deepEqual(getLatestMissedQuestions([first, otherMiss], [questions[0]]).map((q) => q.id), [1]);
});

test('saved history can be cleared and storage errors do not throw', () => {
  const storage = new MemoryStorage();
  savePracticeAttempt(attempt({ id: 'clear-me' }), storage);
  assert.deepEqual(clearPracticeHistory(storage), { cleared: true, status: 'cleared' });
  assert.equal(loadPracticeHistory(storage).status, 'missing');

  const deniedStorage = {
    getItem() { throw new Error('denied'); },
    setItem() { throw new Error('denied'); },
    removeItem() { throw new Error('denied'); },
  };
  assert.equal(loadPracticeHistory(deniedStorage).status, 'unavailable');
  assert.equal(savePracticeAttempt(attempt({ id: 'denied' }), deniedStorage).status, 'unavailable');
  assert.equal(clearPracticeHistory(deniedStorage).status, 'unavailable');
});
