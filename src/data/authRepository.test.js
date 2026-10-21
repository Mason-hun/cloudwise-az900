import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthRepository } from './authRepository.js';

test('auth repository delegates supported flows to Supabase Auth with safe local sign-out', async () => {
  const calls = [];
  const subscription = { unsubscribe() {} };
  const client = {
    auth: {
      onAuthStateChange(callback) {
        calls.push(['subscribe', callback]);
        return { data: { subscription } };
      },
      signUp(input) { calls.push(['signUp', input]); return Promise.resolve({ data: { session: null } }); },
      signInWithPassword(input) { calls.push(['signIn', input]); return Promise.resolve({ data: { session: {} } }); },
      signOut(options) { calls.push(['signOut', options]); return Promise.resolve({ error: null }); },
      resetPasswordForEmail(email, options) { calls.push(['reset', email, options]); return Promise.resolve({ error: null }); },
      updateUser(input) { calls.push(['update', input]); return Promise.resolve({ error: null }); },
    },
  };

  const repository = createAuthRepository(client);
  assert.equal(repository.onAuthStateChange(() => {}) , subscription);
  await repository.signUp('learner@example.test', 'password', 'https://cloudwise.example');
  await repository.signIn('learner@example.test', 'password');
  await repository.signOut();
  await repository.requestPasswordReset('learner@example.test', 'https://cloudwise.example');
  await repository.updatePassword('new-password');

  assert.equal(calls[1][0], 'signUp');
  assert.equal(calls[1][1].options.emailRedirectTo, 'https://cloudwise.example');
  assert.equal(calls[2][0], 'signIn');
  assert.deepEqual(calls[3], ['signOut', { scope: 'local' }]);
  assert.equal(calls[4][0], 'reset');
  assert.deepEqual(calls[5], ['update', { password: 'new-password' }]);
});

test('auth repository rejects missing client configuration', () => {
  assert.throws(() => createAuthRepository(null), /configured Supabase client/);
});
