/**
 * api.js
 * Cliente HTTP central. Todos los servicios pasan por aquí.
 * Todas las peticiones se envían por fetch() al backend Express real,
 * definido en BASE_URL.
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
 * Realiza una petición HTTP contra la API.
 * @param {string} method - GET | POST | PUT | PATCH | DELETE
 * @param {string} endpoint - Ej: '/products' o '/products/123'
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
    throw new ApiError('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 0);
  }

  if (response.status === 401) {
    clearSession();
    navigateTo('/login');
    throw new ApiError('Sesión expirada. Inicia sesión nuevamente.', 401);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(payload?.message || 'Ocurrió un error en el servidor.', response.status);
  }

  // El backend real siempre responde { success, message, data }.
  // Se desenvuelve acá para que los services no tengan que hacerlo.
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body) => request('POST', endpoint, body),
  put: (endpoint, body) => request('PUT', endpoint, body),
  patch: (endpoint, body) => request('PATCH', endpoint, body),
  delete: (endpoint) => request('DELETE', endpoint),
};
