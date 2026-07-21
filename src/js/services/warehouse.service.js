/**
 * warehouse.service.js — Bodegas.
 *
 * La BD real agrega dos columnas que el mock no tenía: `capacity`
 * (capacidad máxima) y `user_id` (usuario responsable de la bodega).
 * Se incluyen ambas mapeadas, aunque las pantallas actuales solo
 * usan name/location — quedan disponibles para cuando se necesiten.
 *
 * ⚠️ Aviso: el controlador `updateWarehouse` del backend tiene un bug
 * (actualiza una tabla mal escrita "Waterhouses" con columnas de
 * usuarios en vez de bodegas). Editar una bodega fallará hasta que se
 * corrija ahí. Avísale a tu compañero de backend.
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
   * Espacio disponible por bodega. El cálculo se hace 100% en el
   * backend (SQL), acá solo se traducen los nombres de columna.
   */
  getCapacity: async () => (await api.get('/warehouses/capacity')).map((row) => ({
    id: row.id,
    name: row.warehouse_name,
    totalCapacity: row.total_capacity,
    usedCapacity: Number(row.used_capacity) || 0,
    remainingCapacity: row.remaining_capacity,
  })),
};
