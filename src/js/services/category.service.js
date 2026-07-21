/**
 * category.service.js — Catálogo de categorías.
 *
 * La base de datos real tiene una tabla `categories` separada de
 * `products` (products solo guarda `category_id`). Este servicio
 * se agrega porque el mock original no la tenía: el mock guardaba
 * el nombre de la categoría directo en el producto (texto libre).
 */
import { api } from './api.js';

export const CategoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', { name: category.name }),
  update: (id, category) => api.put(`/categories/${id}`, { name: category.name }),
  remove: (id) => api.delete(`/categories/${id}`),
};
