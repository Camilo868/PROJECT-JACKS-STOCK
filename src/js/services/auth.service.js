/**
 * auth.service.js — Autenticación de usuarios.
 */
import { api } from './api.js';
import { setSession, clearSession } from '../core/session.js';

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setSession(data);
  return data.user;
}

export async function register(name, email, password) {
  const data = await api.post('/auth/register', { name, email, password });
  setSession(data);
  return data.user;
}

export function logout() {
  clearSession();
}
