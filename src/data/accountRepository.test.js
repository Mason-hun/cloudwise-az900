import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccountRepository } from './accountRepository.js';
import { getAccountRequestError } from './accountProfile.js';

function createMockClient({ userId = 'authenticated-user', userError = null, uploadResult = { data: { path: 'authenticated-user/avatar' }, error: null } } = {}) {
  const calls = [];
  const file = { type: 'image/png', name: 'avatar.png' };
  const downloadedBlob = new Blob(['private image']);
  const client = {
    auth: {
      getUser: async () => {
        calls.push(['getUser']);
        return userError
          ? { data: { user: null }, error: userError }
          : { data: { user: userId ? { id: userId } : null }, error: null };
      },
      updateUser: async (input) => ({ data: { user: {} }, error: null, input }),
    },
    storage: {
      from: (bucket) => ({
        upload: async (path, selectedFile, options) => {
          calls.push(['upload', bucket, path, selectedFile, options]);
          return uploadResult;
        },
        download: async (path) => {
          calls.push(['download', bucket, path]);
          return { data: downloadedBlob, error: null };
        },
      }),
    },
  };
  return { client, calls, file, downloadedBlob };
}

test('successful avatar upload is followed by authenticated private-image retrieval', async () => {
  const { client, calls, file, downloadedBlob } = createMockClient();
  const repository = createAccountRepository(client);
  const upload = await repository.uploadAvatar(file);
  const download = await repository.downloadAvatar();

  assert.equal(upload.error, null);
  assert.equal(download.data, downloadedBlob);
  assert.deepEqual(calls[0], ['getUser']);
  assert.deepEqual(calls[1], ['upload', 'cloudwise-avatars', 'authenticated-user/avatar', file, {
    cacheControl: '0', contentType: 'image/png', upsert: true,
  }]);
  assert.deepEqual(calls[2], ['getUser']);
  assert.deepEqual(calls[3], ['download', 'cloudwise-avatars', 'authenticated-user/avatar']);
});

test('avatar storage path always comes from the current Supabase identity, not a supplied ID', async () => {
  const { client, calls, file } = createMockClient({ userId: 'owner-id' });
  const repository = createAccountRepository(client);
  await repository.uploadAvatar(file, 'attacker-id');
  assert.equal(calls.find(([kind]) => kind === 'upload')[2], 'owner-id/avatar');
});

test('missing or expired authentication session prevents Storage access', async () => {
  const missing = createMockClient({ userId: null });
  const missingResult = await createAccountRepository(missing.client).uploadAvatar(missing.file);
  assert.equal(missingResult.error.code, 'AUTH_SESSION_MISSING');
  assert.equal(missing.calls.some(([kind]) => kind === 'upload'), false);
  assert.match(getAccountRequestError(missingResult.error, { resource: 'avatar' }), /Sign in again/);

  const expired = createMockClient({ userError: { status: 401, message: 'JWT expired' } });
  const expiredResult = await createAccountRepository(expired.client).downloadAvatar();
  assert.equal(expiredResult.error.status, 401);
  assert.match(getAccountRequestError(expiredResult.error, { resource: 'avatar' }), /session has expired/i);
  assert.equal(expired.calls.some(([kind]) => kind === 'download'), false);
});

test('missing bucket and RLS policy failures produce distinct safe guidance', async () => {
  const missingBucket = createMockClient({ uploadResult: {
    data: null,
    error: { status: 404, statusCode: '404', message: 'Bucket not found' },
  } });
  const missingResult = await createAccountRepository(missingBucket.client).uploadAvatar(missingBucket.file);
  assert.match(getAccountRequestError(missingResult.error, { resource: 'avatar' }), /could not find the avatar bucket/i);

  const denied = createMockClient({ uploadResult: {
    data: null,
    error: { status: 400, statusCode: '400', message: 'new row violates row-level security policy' },
  } });
  const deniedResult = await createAccountRepository(denied.client).uploadAvatar(denied.file);
  assert.match(getAccountRequestError(deniedResult.error, { resource: 'avatar' }), /private Storage policies/i);
  assert.doesNotMatch(getAccountRequestError(deniedResult.error, { resource: 'avatar' }), /row-level security policy/);
});

test('network and generic upload failures are not mislabeled as missing bucket setup', async () => {
  const networkError = new TypeError('Failed to fetch');
  const network = createMockClient({ uploadResult: { data: null, error: networkError } });
  const networkResult = await createAccountRepository(network.client).uploadAvatar(network.file);
  assert.match(getAccountRequestError(networkResult.error, { resource: 'avatar' }), /Check your connection/);

  const unrelated = createMockClient({ uploadResult: {
    data: null,
    error: { status: 500, message: 'Internal storage failure' },
  } });
  const unrelatedResult = await createAccountRepository(unrelated.client).uploadAvatar(unrelated.file);
  assert.match(getAccountRequestError(unrelatedResult.error, { resource: 'avatar' }), /could not be completed/);
  assert.doesNotMatch(getAccountRequestError(unrelatedResult.error, { resource: 'avatar' }), /bucket is missing|not set up/i);
});

test('private avatar downloads are requested again on each load instead of persisting a signed URL', async () => {
  const { client, calls } = createMockClient();
  const repository = createAccountRepository(client);
  await repository.downloadAvatar();
  await repository.downloadAvatar();
  assert.equal(calls.filter(([kind]) => kind === 'download').length, 2);
  assert.equal(calls.filter(([kind]) => kind === 'getUser').length, 2);
});

test('missing Storage client configuration is rejected instead of pretending uploads are ready', () => {
  assert.throws(
    () => createAccountRepository({ auth: { updateUser() {} } }),
    /configured Supabase client/,
  );
});

test('profile update errors remain available to the account UI for safe user-facing mapping', async () => {
  const serviceError = { message: 'permission denied while updating user metadata' };
  const repository = createAccountRepository({
    auth: { updateUser: async () => ({ data: null, error: serviceError }) },
    storage: { from() { return {}; } },
  });
  const result = await repository.updateDisplayName('Learner');
  assert.equal(result.error, serviceError);
});
