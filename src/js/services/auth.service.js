/**
 * auth.service.js — Autenticación de usuarios.
 *
 * El backend real expone el login/registro dentro del router de
 * usuarios: POST /users/login y POST /users/register (no /auth/*).
 */
import { api } from './api.js';
import { setSession, clearSession } from '../core/session.js';

export async function login(email, password) {
  const data = await api.post('/users/login', { email, password });
  setSession(data);
  return data.user;
}

export async function register(name, lastName, email, password) {
  const data = await api.post('/users/register', {
    name, last_name: lastName, email, password,
  });
  setSession(data);
  return data.user;
}

export function logout() {
  clearSession();
}
