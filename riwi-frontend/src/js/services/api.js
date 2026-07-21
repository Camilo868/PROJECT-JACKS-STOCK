/**
 * api.js
 * Central HTTP client. All services go through here.
 * All requests are sent via fetch() to the real Express backend,
 * defined in BASE_URL.
 */

import { getToken, clearSession } from '../core/session.js';
import { navigateTo } from '../core/router.js';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:6543',
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Performs an HTTP request against the API.
 * @param {string} method - GET | POST | PUT | PATCH | DELETE
 * @param {string} endpoint - E.g.: '/products' or '/products/123'
 * @param {object} [body]
 */
export async function request(method, endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError('Could not connect to the server. Is the backend running?', 0);
  }

  // A 401 from the login/register endpoints just means "wrong
  // credentials" — there's no session to expire yet, so it shouldn't
  // log the user out or redirect. Only treat 401 as an expired
  // session when we were actually sending a token (i.e. the user was
  // supposedly logged in already).
  const isAuthEndpoint = endpoint.startsWith('/users/login') || endpoint.startsWith('/users/register');
  if (response.status === 401 && token && !isAuthEndpoint) {
    clearSession();
    navigateTo('/login');
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(payload?.message || 'An error occurred on the server.', response.status);
  }

  // The real backend always responds with { success, message, data }.
  // Unwrapped here so services don't have to do it themselves.
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body) => request('POST', endpoint, body),
  put: (endpoint, body) => request('PUT', endpoint, body),
  patch: (endpoint, body) => request('PATCH', endpoint, body),
  delete: (endpoint) => request('DELETE', endpoint),
};
