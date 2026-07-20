/**
 * product.service.js — Catálogo de productos.
 */
import { api } from './api.js';

export const ProductService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  remove: (id) => api.delete(`/products/${id}`),
};
