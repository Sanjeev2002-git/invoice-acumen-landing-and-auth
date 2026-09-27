const AUTH_STORAGE_KEY = 'invoice-acumen.auth';

// Access/refresh tokens now live only in HttpOnly cookies set by the backend -
// JavaScript never has a readable copy, so a XSS payload can't steal them.
// We only cache the (non-sensitive) user profile here for a snappy UI on reload;
// the real source of truth is the session cookie, validated via GET /auth/me.

export function getCachedUser() {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    clearAuthState();
    return null;
  }
}

export function saveCachedUser(user) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function updateCachedUser(partial) {
  const current = getCachedUser();
  const updated = { ...current, ...partial };
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAuthState() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  // Remove credentials written by pre-hardening versions during the migration.
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
