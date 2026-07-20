/**
 * purchase.service.js — Órdenes de compra.
 */
import { api } from './api.js';

export const PurchaseService = {
  getAll: () => api.get('/purchases'),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (order) => api.post('/purchases', order),
  updateStatus: (id, status) => api.put(`/purchases/${id}`, { status }),
  remove: (id) => api.delete(`/purchases/${id}`),
};
