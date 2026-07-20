/**
 * session.js
 * Maneja la persistencia de la sesión del usuario autenticado.
 * Usa localStorage para mantener la sesión activa entre recargas.
 */

const SESSION_KEY = 'stockwise_session';

/**
 * Guarda la sesión del usuario autenticado.
 * @param {{ token: string, user: object }} sessionData
 */
export function setSession(sessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Obtiene la sesión actual, o null si no existe.
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
