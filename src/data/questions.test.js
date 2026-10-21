import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from './questions.js';

const expectedDomainCounts = new Map([
  ['Cloud Concepts', 10],
  ['Azure Architecture and Services', 14],
  ['Azure Management and Governance', 12],
]);

test('question bank has 36 complete, uniquely identified questions across the expected domains', () => {
  assert.equal(questions.length, 36);

  const questionIds = new Set();
  const domainCounts = new Map([...expectedDomainCounts.keys()].map((domain) => [domain, 0]));

  for (const question of questions) {
    assert.ok(question && typeof question === 'object');
    for (const field of ['id', 'domain', 'topic', 'objective', 'text', 'explanation']) {
      assert.ok(String(question[field] ?? '').trim(), `question ${question.id} needs ${field}`);
    }
    assert.ok(!questionIds.has(question.id), `duplicate question ID ${question.id}`);
    questionIds.add(question.id);

    assert.ok(domainCounts.has(question.domain), `unexpected domain ${question.domain}`);
    domainCounts.set(question.domain, domainCounts.get(question.domain) + 1);

    assert.ok(Array.isArray(question.options) && question.options.length >= 2);
    const optionIds = new Set();
    for (const option of question.options) {
      assert.ok(String(option?.id ?? '').trim(), `question ${question.id} has an option without an ID`);
      assert.ok(String(option?.text ?? '').trim(), `question ${question.id} has an option without text`);
      assert.ok(!optionIds.has(option.id), `question ${question.id} has duplicate option ID ${option.id}`);
      optionIds.add(option.id);
    }
    assert.equal(
      [...optionIds].filter((optionId) => optionId === question.correctAnswer).length,
      1,
      `question ${question.id} must have exactly one matching correct answer option`,
    );
  }

  assert.deepEqual(domainCounts, expectedDomainCounts);
});

test('the original twelve question IDs remain stable for saved practice history', () => {
  assert.deepEqual(questions.slice(0, 12).map(({ id }) => id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});
