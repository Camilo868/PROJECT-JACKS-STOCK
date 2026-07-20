/**
 * movement.service.js — Entradas y salidas de inventario.
 */
import { api } from './api.js';

export const MovementService = {
  getAll: () => api.get('/movements'),
  getByProduct: (productId) => api.get(`/movements?productId=${productId}`),
  create: (movement) => api.post('/movements', movement),
};
