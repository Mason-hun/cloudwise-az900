const PLACEHOLDER_PATTERN = /[<>]/;

function isPublishableKey(key) {
  if (key.startsWith('sb_publishable_')) return true;

  const parts = key.split('.');
  if (parts.length !== 3 || typeof globalThis.atob !== 'function') return false;

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(globalThis.atob(payload)).role === 'anon';
  } catch {
    return false;
  }
}

export function readSupabaseConfig(environment = {}) {
  const urlValue = String(environment.VITE_SUPABASE_URL ?? '').trim();
  const keyValue = String(environment.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

  if (!urlValue && !keyValue) {
    return {
      configured: false,
      reason: 'missing',
      message: 'Cloud accounts are not configured in this build. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart Vite. Guest practice is still available.',
    };
  }

  if (!urlValue || !keyValue || PLACEHOLDER_PATTERN.test(urlValue) || PLACEHOLDER_PATTERN.test(keyValue)) {
    return {
      configured: false,
      reason: 'incomplete',
      message: 'Cloud account configuration is incomplete. Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your project values. Guest practice is still available.',
    };
  }

  if (!isPublishableKey(keyValue)) {
    return {
      configured: false,
      reason: 'invalid-key',
      message: 'VITE_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key (or legacy anon key), never a secret or service-role key. Guest practice is still available.',
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(urlValue);
  } catch {
    return {
      configured: false,
      reason: 'invalid-url',
      message: 'VITE_SUPABASE_URL must be a valid HTTPS URL (HTTP is allowed for localhost development). Guest practice is still available.',
    };
  }

  const isLocalHttp = parsedUrl.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname);
  if ((parsedUrl.protocol !== 'https:' && !isLocalHttp) || parsedUrl.username || parsedUrl.password) {
    return {
      configured: false,
      reason: 'invalid-url',
      message: 'VITE_SUPABASE_URL must use HTTPS, except for a local development URL. Guest practice is still available.',
    };
  }

  return {
    configured: true,
    url: parsedUrl.toString().replace(/\/$/, ''),
    publishableKey: keyValue,
  };
}
