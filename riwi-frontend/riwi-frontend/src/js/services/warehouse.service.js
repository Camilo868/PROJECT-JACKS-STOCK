/**
 * warehouse.service.js — Warehouses.
 *
 * The real DB adds two columns the mock didn't have: `capacity`
 * (maximum capacity) and `user_id` (the warehouse's responsible
 * user). Both are mapped, even though current screens only use
 * name/location — available for whenever they're needed.
 */
import { api } from './api.js';

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location || '',
    capacity: row.capacity ?? null,
    userId: row.user_id ?? null,
  };
}

function toDb(payload) {
  return {
    name: payload.name,
    location: payload.location,
    capacity: payload.capacity ?? null,
    user_id: payload.userId ?? null,
  };
}

export const WarehouseService = {
  getAll: async () => (await api.get('/warehouses')).map(fromDb),
  getById: async (id) => fromDb(await api.get(`/warehouses/${id}`)),
  create: (warehouse) => api.post('/warehouses', toDb(warehouse)),
  update: (id, warehouse) => api.put(`/warehouses/${id}`, toDb(warehouse)),
  remove: (id) => api.delete(`/warehouses/${id}`),

  /**
   * Available space per warehouse. The calculation happens 100% in
   * the backend (SQL) — only column names are translated here.
   */
  getCapacity: async () => (await api.get('/warehouses/capacity')).map((row) => ({
    id: row.id,
    name: row.warehouse_name,
    totalCapacity: row.total_capacity,
    usedCapacity: Number(row.used_capacity) || 0,
    remainingCapacity: row.remaining_capacity,
  })),
};
