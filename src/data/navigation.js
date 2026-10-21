const PRACTICE_VIEWS = new Set(['selection', 'quiz', 'results']);

export const FEATURE_DESTINATIONS = Object.freeze({
  dashboard: 'dashboard',
  practice: 'selection',
  'domain-review': 'domain-review',
  'revision-notes': 'revision-notes',
  account: 'account',
});

export function rememberPracticeView(view, previousPracticeView = 'selection') {
  return PRACTICE_VIEWS.has(view) ? view : previousPracticeView;
}

export function resolveFeatureDestination(destination, lastPracticeView = 'selection') {
  if (destination === 'practice') return PRACTICE_VIEWS.has(lastPracticeView) ? lastPracticeView : 'selection';
  return FEATURE_DESTINATIONS[destination] ?? 'dashboard';
}

export function getActiveNavigationItem(view, authReturnView = 'dashboard') {
  if (view === 'auth') return getActiveNavigationItem(authReturnView === 'auth' ? 'dashboard' : authReturnView);
  if (PRACTICE_VIEWS.has(view)) return 'practice';
  if (view === 'account') return 'account';
  if (view === 'domain-review') return 'domain-review';
  if (view === 'revision-notes') return 'revision-notes';
  return 'dashboard';
}
