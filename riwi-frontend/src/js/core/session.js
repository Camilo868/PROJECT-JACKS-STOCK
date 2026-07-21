/**
 * session.js
 * Handles persistence of the authenticated user's session.
 * Uses localStorage to keep the session active across reloads.
 */

const SESSION_KEY = 'stockwise_session';

/**
 * Saves the authenticated user's session.
 * @param {{ token: string, user: object }} sessionData
 */
export function setSession(sessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Gets the current session, or null if none exists.
 * @returns {{ token: string, user: object } | null}
 */
export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @returns {boolean} */
export function isAuthenticated() {
  return getSession() !== null;
}

/** @returns {object|null} */
export function getCurrentUser() {
  const session = getSession();
  return session ? session.user : null;
}

/** @returns {string|null} */
export function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
