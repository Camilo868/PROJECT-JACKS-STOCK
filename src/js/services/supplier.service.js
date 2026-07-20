/**
 * supplier.service.js — Proveedores.
 */
import { api } from './api.js';

export const SupplierService = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplier) => api.post('/suppliers', supplier),
  update: (id, supplier) => api.put(`/suppliers/${id}`, supplier),
  remove: (id) => api.delete(`/suppliers/${id}`),
};
