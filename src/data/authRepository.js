export function createAuthRepository(client) {
  if (!client?.auth) {
    throw new TypeError('A configured Supabase client is required for authentication.');
  }

  return {
    onAuthStateChange(callback) {
      const { data, error } = client.auth.onAuthStateChange(callback);
      if (error) throw error;
      return data.subscription;
    },

    signUp(email, password, emailRedirectTo) {
      return client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
    },

    signIn(email, password) {
      return client.auth.signInWithPassword({ email, password });
    },

    signOut() {
      return client.auth.signOut({ scope: 'local' });
    },

    requestPasswordReset(email, redirectTo) {
      return client.auth.resetPasswordForEmail(email, { redirectTo });
    },

    updatePassword(password) {
      return client.auth.updateUser({ password });
    },
  };
}
