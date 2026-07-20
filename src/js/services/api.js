/**
 * api.js
 * Cliente HTTP central. Todos los servicios deben pasar por aquí.
 *
 * MOCK_MODE=true  -> las peticiones se resuelven contra localStorage
 *                     (mock-db.js), permitiendo demostrar la app sin
 *                     backend real.
 * MOCK_MODE=false -> las peticiones se envían por fetch() al backend
 *                     Express definido en BASE_URL.
 *
 * Para integrar el backend real solo se debe cambiar MOCK_MODE a false
 * y ajustar BASE_URL. Ningún servicio ni página necesita modificarse.
 */

import { db, generateId } from '../core/mock-db.js';
import { getToken, clearSession } from '../core/session.js';
import { navigateTo } from '../core/router.js';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  MOCK_MODE: true,
  MOCK_LATENCY_MS: 220,
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* Mock resolver: simula endpoints REST estándar por recurso          */
/* ------------------------------------------------------------------ */

const SIMPLE_RESOURCES = ['products', 'suppliers', 'warehouses', 'movements'];

async function resolveMock(method, endpoint, body) {
  await delay(API_CONFIG.MOCK_LATENCY_MS);
  const [path, queryString] = endpoint.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));

  // ---- AUTH ----
  if (parts[0] === 'auth') {
    if (parts[1] === 'login' && method === 'POST') {
      const user = db.find('users', (u) => u.email === body.email && u.password === body.password);
      if (!user) throw new ApiError('Correo o contraseña incorrectos.', 401);
      const { password, ...safeUser } = user;
      return { token: `mock-token-${safeUser.id}`, user: safeUser };
    }
    if (parts[1] === 'register' && method === 'POST') {
      const exists = db.find('users', (u) => u.email === body.email);
      if (exists) throw new ApiError('Ya existe una cuenta con este correo.', 409);
      const user = db.insert('users', { name: body.name, email: body.email, password: body.password, role: 'encargado' });
      const { password, ...safeUser } = user;
      return { token: `mock-token-${safeUser.id}`, user: safeUser };
    }
    throw new ApiError('Endpoint de autenticación no encontrado.', 404);
  }

  // ---- PURCHASES (lógica propia: no es un CRUD simple) ----
  if (parts[0] === 'purchases') {
    if (method === 'GET' && parts.length === 1) return db.list('purchases');
    if (method === 'GET' && parts.length === 2) {
      const item = db.find('purchases', (p) => p.id === parts[1]);
      if (!item) throw new ApiError('Orden de compra no encontrada.', 404);
      return item;
    }
    if (method === 'POST' && parts.length === 1) {
      const total = body.items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
      return db.insert('purchases', { ...body, status: 'pendiente', total });
    }
    if (method === 'PUT' && parts.length === 2) {
      const updated = db.update('purchases', parts[1], body);
      if (!updated) throw new ApiError('Orden de compra no encontrada.', 404);
      return updated;
    }
    if (method === 'DELETE' && parts.length === 2) {
      const ok = db.remove('purchases', parts[1]);
      if (!ok) throw new ApiError('Orden de compra no encontrada.', 404);
      return { success: true };
    }
  }

  // ---- MOVEMENTS (side effect: actualiza stock del producto) ----
  if (parts[0] === 'movements') {
    if (method === 'GET' && parts.length === 1) {
      let items = db.list('movements');
      if (query.productId) items = items.filter((m) => m.productId === query.productId);
      return items.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if (method === 'POST' && parts.length === 1) {
      const product = db.find('products', (p) => p.id === body.productId);
      if (!product) throw new ApiError('Producto no encontrado.', 404);
      if (body.type === 'salida' && body.quantity > product.currentStock) {
        throw new ApiError('La cantidad de salida supera el stock disponible.', 422);
      }
      const nextStock = body.type === 'entrada'
        ? product.currentStock + Number(body.quantity)
        : product.currentStock - Number(body.quantity);
      db.update('products', product.id, { currentStock: nextStock });
      return db.insert('movements', { ...body, date: body.date || new Date().toISOString() });
    }
  }

  // ---- CRUD genérico para products / suppliers / warehouses ----
  if (SIMPLE_RESOURCES.includes(parts[0])) {
    const resource = parts[0];
    if (method === 'GET' && parts.length === 1) return db.list(resource);
    if (method === 'GET' && parts.length === 2) {
      const item = db.find(resource, (r) => r.id === parts[1]);
      if (!item) throw new ApiError('Recurso no encontrado.', 404);
      return item;
    }
    if (method === 'POST' && parts.length === 1) return db.insert(resource, body);
    if (method === 'PUT' && parts.length === 2) {
      const updated = db.update(resource, parts[1], body);
      if (!updated) throw new ApiError('Recurso no encontrado.', 404);
      return updated;
    }
    if (method === 'DELETE' && parts.length === 2) {
      const ok = db.remove(resource, parts[1]);
      if (!ok) throw new ApiError('Recurso no encontrado.', 404);
      return { success: true };
    }
  }

  throw new ApiError(`Endpoint no soportado: ${method} ${endpoint}`, 404);
}

/* ------------------------------------------------------------------ */
/* Fetch real (para cuando el backend Express esté disponible)         */
/* ------------------------------------------------------------------ */

async function resolveFetch(method, endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    clearSession();
    navigateTo('/login');
    throw new ApiError('Sesión expirada. Inicia sesión nuevamente.', 401);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.message || 'Ocurrió un error en el servidor.', response.status);
  }

  return data;
}

/**
 * Realiza una petición HTTP contra la API.
 * @param {string} method - GET | POST | PUT | DELETE
 * @param {string} endpoint - Ej: '/products' o '/products/123'
 * @param {object} [body]
 */
export async function request(method, endpoint, body) {
  try {
    if (API_CONFIG.MOCK_MODE) {
      return await resolveMock(method, endpoint, body);
    }
    return await resolveFetch(method, endpoint, body);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Error de conexión con el servidor.', 0);
  }
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body) => request('POST', endpoint, body),
  put: (endpoint, body) => request('PUT', endpoint, body),
  delete: (endpoint) => request('DELETE', endpoint),
};
