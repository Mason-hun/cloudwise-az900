import { AVATAR_BUCKET } from './accountProfile.js';

export function createAccountRepository(client) {
  if (!client?.auth || !client?.storage) throw new TypeError('A configured Supabase client is required for account actions.');

  async function getAuthenticatedUserId() {
    if (typeof client.auth.getUser !== 'function') {
      return { error: { code: 'AUTH_SESSION_MISSING', message: 'Sign in to manage your profile photo.' } };
    }
    const { data, error } = await client.auth.getUser();
    if (error) return { error };
    const userId = data?.user?.id;
    if (!userId) return { error: { code: 'AUTH_SESSION_MISSING', message: 'Sign in to manage your profile photo.' } };
    return { userId };
  }

  return {
    updateDisplayName(displayName) {
      return client.auth.updateUser({ data: { display_name: displayName } });
    },

    updatePassword(password) {
      return client.auth.updateUser({ password });
    },

    async uploadAvatar(file) {
      const { userId, error } = await getAuthenticatedUserId();
      if (error) return { data: null, error };
      return client.storage.from(AVATAR_BUCKET).upload(`${userId}/avatar`, file, {
        cacheControl: '0',
        contentType: file.type,
        upsert: true,
      });
    },

    async downloadAvatar() {
      const { userId, error } = await getAuthenticatedUserId();
      if (error) return { data: null, error };
      return client.storage.from(AVATAR_BUCKET).download(`${userId}/avatar`);
    },
  };
}
