import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccountOperationLock, getAccountProfile, getAccountRequestError, isMissingAvatarObjectError, renderAccountIdentity, renderCompactAvatarContents, validateAvatarFile, validateDisplayName, validatePasswordChange } from './accountProfile.js';

test('account identity uses available metadata and falls back to safe initials', () => {
  assert.equal(getAccountProfile({ email: 'learner@example.test' }).initials, 'LE');
  const markup = renderAccountIdentity({ email: '<learner>@example.test', user_metadata: { display_name: '<Learner>' } });
  assert.match(markup, /&lt;Learner&gt;/);
  assert.doesNotMatch(markup, /<Learner>/);
  assert.match(renderAccountIdentity({ email: 'learner@example.test' }, '', { showEdit: true }), /data-edit-name/);
});

test('compact navigation avatars use the private image URL or initials without a broken image fallback', () => {
  const user = { email: 'learner@example.test' };
  const fallback = renderCompactAvatarContents(user, '', 'nav-account-avatar');
  assert.match(fallback, /nav-account-avatar-initials/);
  assert.match(fallback, />LE<\/span>/);
  assert.doesNotMatch(fallback, /<img/);

  const image = renderCompactAvatarContents(user, 'blob:private-avatar', 'nav-account-avatar');
  assert.match(image, /nav-account-avatar-image/);
  assert.match(image, /src="blob:private-avatar"/);
  assert.doesNotMatch(image, /nav-account-avatar-initials/);
});

test('password change validation requires a reasonable length and matching confirmation', () => {
  assert.match(validatePasswordChange('short', 'short'), /8 characters/);
  assert.match(validatePasswordChange('long-enough', 'different'), /do not match/);
  assert.equal(validatePasswordChange('long-enough', 'long-enough'), '');
});

test('display name validation rejects blank or overlong values and accepts trimmed names', () => {
  assert.match(validateDisplayName('  '), /Enter a display name/);
  assert.match(validateDisplayName('a'.repeat(81)), /80 characters/);
  assert.equal(validateDisplayName('  Learner  '), '');
});

test('avatar validation limits images to supported types and size', () => {
  assert.equal(validateAvatarFile({ type: 'image/png', size: 100 }), '');
  assert.match(validateAvatarFile({ type: 'image/svg+xml', size: 100 }), /JPG, PNG, or WebP/);
  assert.match(validateAvatarFile({ type: 'image/png', size: 3 * 1024 * 1024 }), /smaller than 2 MB/);
});

test('account requests expose a safe network message and useful service errors', () => {
  assert.match(getAccountRequestError(new TypeError('Failed to fetch')), /Check your connection/);
  assert.match(getAccountRequestError({ message: 'Bucket not found' }, { resource: 'avatar' }), /could not find the avatar bucket/);
  assert.match(getAccountRequestError({ message: 'permission denied for storage object' }, { resource: 'avatar' }), /private Storage policies/);
  assert.match(getAccountRequestError({ message: 'JWT expired' }), /session has expired/);
  assert.match(getAccountRequestError({ code: 'SUPABASE_NOT_CONFIGURED' }), /not configured in this build/);
  assert.doesNotMatch(getAccountRequestError({ message: 'provider detail: private backend data' }), /private backend data/);
  assert.match(getAccountRequestError({}), /could not be completed/);
});

test('only an explicit missing-object response is treated as an absent avatar', () => {
  assert.equal(isMissingAvatarObjectError({ statusCode: '404', message: 'Object not found' }), true);
  assert.equal(isMissingAvatarObjectError({ statusCode: '404', message: 'Bucket not found' }), false);
  assert.equal(isMissingAvatarObjectError({ statusCode: '403', message: 'Object not found' }), false);
});

test('account operation lock rejects duplicate concurrent actions and can be released', () => {
  const lock = createAccountOperationLock();
  assert.equal(lock.acquire(), true);
  assert.equal(lock.acquire(), false);
  lock.release();
  assert.equal(lock.acquire(), true);
});
