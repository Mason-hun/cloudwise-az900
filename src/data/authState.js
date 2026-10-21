export function createInitialAuthState(isConfigured) {
  return {
    status: isConfigured ? 'restoring' : 'unconfigured',
    busy: false,
    message: '',
    error: '',
    recoveryRequested: false,
    localSignOutPending: false,
  };
}

export function getRegistrationSuccessMessage(hasSession) {
  return hasSession
    ? 'Your account is ready and you are signed in.'
    : 'Registration was submitted. If email confirmation is required, check your inbox and confirm your address before signing in.';
}

export function reduceAuthState(state, action) {
  switch (action.type) {
    case 'AUTH_EVENT': {
      if (action.event === 'PASSWORD_RECOVERY') {
        return {
          ...state,
          status: action.hasSession ? 'authenticated' : 'guest',
          busy: false,
          message: '',
          error: '',
          recoveryRequested: true,
          localSignOutPending: false,
        };
      }

      if (action.event === 'SIGNED_OUT') {
        const expired = state.status === 'authenticated' && !state.localSignOutPending;
        return {
          ...state,
          status: expired ? 'expired' : 'guest',
          busy: false,
          message: expired ? 'Your account session ended. Guest practice is still available; sign in again to use account features.' : '',
          error: '',
          recoveryRequested: false,
          localSignOutPending: false,
        };
      }

      if (action.hasSession) {
        return {
          ...state,
          status: 'authenticated',
          busy: false,
          message: '',
          error: '',
          recoveryRequested: false,
          localSignOutPending: false,
        };
      }

      if (action.event === 'INITIAL_SESSION') {
        return {
          ...state,
          status: 'guest',
          busy: false,
          recoveryRequested: false,
          localSignOutPending: false,
        };
      }

      return state;
    }
    case 'REQUEST_STARTED':
      return { ...state, busy: true, message: '', error: '' };
    case 'REQUEST_SUCCEEDED':
      return { ...state, busy: false, message: action.message ?? '', error: '' };
    case 'REQUEST_FAILED':
      return { ...state, busy: false, message: '', error: action.message };
    case 'INITIALIZATION_FAILED':
      return { ...state, status: 'guest', busy: false, message: '', error: action.message };
    case 'LOCAL_SIGN_OUT_STARTED':
      return { ...state, busy: true, message: '', error: '', localSignOutPending: true };
    case 'LOCAL_SIGN_OUT_FAILED':
      return { ...state, status: 'authenticated', busy: false, error: action.message, localSignOutPending: false };
    case 'RECOVERY_FINISHED':
      return { ...state, status: 'authenticated', busy: false, recoveryRequested: false, message: action.message, error: '' };
    case 'CLEAR_NOTICE':
      return { ...state, message: '', error: '' };
    default:
      return state;
  }
}
