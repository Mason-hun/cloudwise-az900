import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveNavigationItem, rememberPracticeView, resolveFeatureDestination } from './navigation.js';

test('feature navigation preserves the active practice view for later return', () => {
  const remembered = rememberPracticeView('quiz', 'selection');
  assert.equal(resolveFeatureDestination('dashboard', remembered), 'dashboard');
  assert.equal(resolveFeatureDestination('practice', remembered), 'quiz');
  assert.equal(resolveFeatureDestination('practice', rememberPracticeView('account', remembered)), 'quiz');
});

test('navigation active state follows real practice, review, revision, and account views', () => {
  assert.equal(getActiveNavigationItem('results'), 'practice');
  assert.equal(getActiveNavigationItem('domain-review'), 'domain-review');
  assert.equal(getActiveNavigationItem('revision-notes'), 'revision-notes');
  assert.equal(getActiveNavigationItem('auth', 'account'), 'account');
  assert.equal(getActiveNavigationItem('auth', 'quiz'), 'practice');
});
