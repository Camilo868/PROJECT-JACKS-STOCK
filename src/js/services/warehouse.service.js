/**
 * warehouse.service.js — Bodegas.
 */
import { api } from './api.js';

export const WarehouseService = {
  getAll: () => api.get('/warehouses'),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (warehouse) => api.post('/warehouses', warehouse),
  update: (id, warehouse) => api.put(`/warehouses/${id}`, warehouse),
  remove: (id) => api.delete(`/warehouses/${id}`),
};
