import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialAuthState, getRegistrationSuccessMessage, reduceAuthState } from './authState.js';

test('auth state distinguishes unconfigured guest mode from session restoration', () => {
  assert.equal(createInitialAuthState(false).status, 'unconfigured');
  assert.equal(createInitialAuthState(true).status, 'restoring');
});

test('initial session, successful sign in, and explicit sign out transition without touching guest storage', () => {
  let state = createInitialAuthState(true);
  state = reduceAuthState(state, { type: 'AUTH_EVENT', event: 'INITIAL_SESSION', hasSession: false });
  assert.equal(state.status, 'guest');
  state = reduceAuthState(state, { type: 'AUTH_EVENT', event: 'SIGNED_IN', hasSession: true });
  assert.equal(state.status, 'authenticated');
  state = reduceAuthState(state, { type: 'LOCAL_SIGN_OUT_STARTED' });
  state = reduceAuthState(state, { type: 'AUTH_EVENT', event: 'SIGNED_OUT', hasSession: false });
  assert.equal(state.status, 'guest');
});

test('password recovery and expired-session states remain available to the UI', () => {
  let state = reduceAuthState(createInitialAuthState(true), {
    type: 'AUTH_EVENT', event: 'PASSWORD_RECOVERY', hasSession: true,
  });
  assert.equal(state.recoveryRequested, true);
  state = reduceAuthState(state, { type: 'AUTH_EVENT', event: 'SIGNED_OUT', hasSession: false });
  assert.equal(state.status, 'expired');
  assert.match(state.message, /Guest practice is still available/);
});

test('loading, success, and failure status transitions are explicit', () => {
  let state = createInitialAuthState(true);
  state = reduceAuthState(state, { type: 'REQUEST_STARTED' });
  assert.equal(state.busy, true);
  state = reduceAuthState(state, { type: 'REQUEST_SUCCEEDED', message: 'Check your email.' });
  assert.equal(state.busy, false);
  assert.equal(state.message, 'Check your email.');
  state = reduceAuthState(state, { type: 'REQUEST_FAILED', message: 'Try again.' });
  assert.equal(state.error, 'Try again.');
});

test('registration distinguishes an active session from required email confirmation', () => {
  assert.match(getRegistrationSuccessMessage(false), /confirm your address before signing in/);
  assert.match(getRegistrationSuccessMessage(true), /you are signed in/);
});
