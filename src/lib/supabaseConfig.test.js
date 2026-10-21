import test from 'node:test';
import assert from 'node:assert/strict';
import { readSupabaseConfig } from './supabaseConfig.js';

test('missing Supabase configuration keeps guest mode available with a helpful message', () => {
  const config = readSupabaseConfig({});
  assert.equal(config.configured, false);
  assert.equal(config.reason, 'missing');
  assert.match(config.message, /Guest practice is still available/);
  assert.match(config.message, /VITE_SUPABASE_URL/);
});

test('partial and placeholder configuration is rejected without exposing values', () => {
  assert.equal(readSupabaseConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co' }).reason, 'incomplete');
  const config = readSupabaseConfig({
    VITE_SUPABASE_URL: 'https://<project-ref>.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: '<placeholder>',
  });
  assert.equal(config.configured, false);
  assert.equal(config.message.includes('<project-ref>'), false);
});

test('only HTTPS or localhost HTTP URLs are accepted', () => {
  const key = 'sb_publishable_test-value';
  assert.equal(readSupabaseConfig({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_PUBLISHABLE_KEY: key }).reason, 'invalid-url');
  assert.equal(readSupabaseConfig({ VITE_SUPABASE_URL: 'http://example.com', VITE_SUPABASE_PUBLISHABLE_KEY: key }).reason, 'invalid-url');
  assert.equal(readSupabaseConfig({ VITE_SUPABASE_URL: 'http://localhost:54321', VITE_SUPABASE_PUBLISHABLE_KEY: key }).configured, true);
});

test('secret and service-role keys are rejected', () => {
  const payload = globalThis.btoa(JSON.stringify({ role: 'service_role' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const serviceRoleJwt = `header.${payload}.signature`;
  const url = 'https://project.supabase.co';
  assert.equal(readSupabaseConfig({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test-value',
  }).reason, 'invalid-key');
  assert.equal(readSupabaseConfig({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: serviceRoleJwt,
  }).reason, 'invalid-key');
});

test('legacy anon JWT keys remain supported', () => {
  const payload = globalThis.btoa(JSON.stringify({ role: 'anon' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  assert.equal(readSupabaseConfig({
    VITE_SUPABASE_URL: 'https://project.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: `header.${payload}.signature`,
  }).configured, true);
});

test('valid configuration is normalized and returned without logging or mutation', () => {
  const config = readSupabaseConfig({
    VITE_SUPABASE_URL: 'https://project.supabase.co/',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test-value',
  });
  assert.deepEqual(config, {
    configured: true,
    url: 'https://project.supabase.co',
    publishableKey: 'sb_publishable_test-value',
  });
});
