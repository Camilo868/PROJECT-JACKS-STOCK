/**
 * category.service.js — Category catalog.
 *
 * The real database has a `categories` table separate from
 * `products` (products only stores `category_id`).
 */
import { api } from './api.js';

export const CategoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', { name: category.name }),
  update: (id, category) => api.put(`/categories/${id}`, { name: category.name }),
  remove: (id) => api.delete(`/categories/${id}`),
};
