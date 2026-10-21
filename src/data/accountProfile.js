export const AVATAR_BUCKET = 'cloudwise-avatars';
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

export function getAccountProfile(user) {
  const metadata = user?.user_metadata ?? {};
  const email = String(user?.email ?? '');
  const displayName = String(metadata.display_name ?? metadata.full_name ?? '').trim();
  const name = displayName || email.split('@')[0] || 'CloudWise learner';
  const confirmedAt = user?.email_confirmed_at ?? user?.confirmed_at ?? null;
  const nameInitials = name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  const confirmationKnown = Boolean(confirmedAt) || user?.email_confirmed_at === null || user?.confirmed_at === null;
  return {
    email,
    displayName,
    name,
    initials: (displayName ? nameInitials : email.split('@')[0].slice(0, 2).toUpperCase()) || nameInitials || 'CW',
    emailConfirmed: Boolean(confirmedAt),
    emailStatus: confirmedAt ? 'Email confirmed' : confirmationKnown ? 'Confirmation pending' : 'Email status unavailable',
    emailStatusClass: confirmedAt ? 'is-confirmed' : confirmationKnown ? 'is-pending' : 'is-unknown',
    createdAt: user?.created_at ?? null,
  };
}

export function validatePasswordChange(password, confirmation) {
  if (typeof password !== 'string' || password.length < 8) return 'Use at least 8 characters for your new password.';
  if (password !== confirmation) return 'The new passwords do not match.';
  return '';
}

export function validateDisplayName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Enter a display name.';
  if (name.length > 80) return 'Use 80 characters or fewer for your display name.';
  return '';
}

export function createAccountOperationLock() {
  let locked = false;
  return {
    acquire() {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() {
      locked = false;
    },
  };
}

export function validateAvatarFile(file) {
  if (!file) return 'Choose an image to upload.';
  if (!AVATAR_MIME_TYPES.includes(file.type)) return 'Choose a JPG, PNG, or WebP image.';
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > AVATAR_MAX_BYTES) return 'Choose an image smaller than 2 MB.';
  return '';
}

export function getAccountRequestError(error, { resource = 'account' } = {}) {
  const message = String(error?.message ?? '');
  const code = String(error?.code ?? error?.statusCode ?? '');
  const status = Number(error?.status ?? error?.statusCode ?? 0);
  if (code === 'SUPABASE_NOT_CONFIGURED' || /configured supabase client is required/i.test(message)) {
    return 'Cloud account services are not configured in this build. Guest practice is still available.';
  }
  if (code === 'AUTH_SESSION_MISSING' || /auth session missing|sign in to manage/i.test(message)) {
    return 'Sign in again before changing your profile photo.';
  }
  if (code === 'AVATAR_RETRIEVAL_FAILED') {
    return 'Your photo was uploaded, but CloudWise could not reload it. Check the private Storage read policy and try again.';
  }
  if (error?.name === 'AuthRetryableFetchError' || /failed to fetch|network|fetch failed|timeout/i.test(message)) {
    return 'Cloud accounts could not be reached. Check your connection and try again.';
  }
  if (/bucket not found/i.test(message) || (status === 404 && /bucket/i.test(message))) {
    return resource === 'avatar'
      ? 'CloudWise could not find the avatar bucket in this configured project. Check the project URL and apply the private avatar Storage setup if needed.'
      : 'A required account service is unavailable. Please try again later.';
  }
  if (/jwt expired|token.*expired|session.*expired/i.test(message) || status === 401) {
    return 'Your sign-in session has expired. Sign in again, then retry.';
  }
  if (/permission|unauthorized|forbidden|row-level security|violates.*policy/i.test(message) || status === 403) {
    return resource === 'avatar'
      ? 'CloudWise could not access this profile photo. Check the private Storage policies and try again.'
      : 'CloudWise could not access this account resource. Check that you are signed in and try again.';
  }
  if (resource === 'avatar' && /storage.*not configured/i.test(message)) {
    return 'Profile photo Storage is not configured for this project. Ask the project administrator to finish the private bucket setup.';
  }
  return 'This account request could not be completed. Please try again.';
}

export function isMissingAvatarObjectError(error) {
  return error?.statusCode === '404'
    && /object not found/i.test(String(error?.message ?? ''));
}

export function renderCompactAvatarContents(user, avatarUrl = '', className = 'compact-avatar') {
  const initials = getAccountProfile(user).initials;
  const image = avatarUrl
    ? `<img class="${escapeHTML(className)}-image" src="${escapeHTML(avatarUrl)}" alt="" />`
    : `<span class="${escapeHTML(className)}-initials">${escapeHTML(initials)}</span>`;
  return image;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function renderAccountIdentity(user, avatarUrl = '', { showEdit = false } = {}) {
  const profile = getAccountProfile(user);
  const avatar = avatarUrl
    ? `<img class="account-avatar-image" src="${escapeHTML(avatarUrl)}" alt="${escapeHTML(`${profile.name}'s profile picture`)}" />`
    : `<span class="account-avatar-initials" aria-hidden="true">${escapeHTML(profile.initials)}</span>`;
  return `<div class="account-avatar">${avatar}</div>
    <div class="account-identity-copy"><p class="eyebrow">SIGNED-IN ACCOUNT</p><div class="account-name-heading"><h2 id="account-profile-title">${escapeHTML(profile.name)}</h2>${showEdit ? '<button class="text-button" data-edit-name type="button">Edit name</button>' : ''}</div><p>${escapeHTML(profile.email)}</p>
    <span class="account-email-status ${profile.emailStatusClass}">${profile.emailStatus}</span></div>`;
}
