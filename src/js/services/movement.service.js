/**
 * movement.service.js — Entradas y salidas de inventario.
 *
 * Diferencias con la BD real:
 *   - La BD usa `movement_type` con valores 'IN' / 'OUT' (mayúsculas),
 *     no 'entrada' / 'salida'. Se traduce en los dos sentidos.
 *   - La BD exige `warehouse_id`: un movimiento pasa en UNA bodega
 *     específica (afecta el stock de esa bodega en `inventory`). El
 *     mock no lo pedía porque el producto tenía una sola bodega fija.
 *   - La BD NO tiene columna para la "nota" que se escribía al
 *     registrar un movimiento. Se sigue pidiendo en el formulario por
 *     si se agrega esa columna más adelante, pero por ahora NO se
 *     guarda en el backend real (avisar al equipo si se necesita).
 *   - `date` (mock) es `movement_date` (BD).
 *
 * Además, registrar un movimiento debe actualizar el stock real en
 * `inventory` (antes esto lo hacía el mock automáticamente). Como el
 * backend no tiene esa lógica automática todavía, este servicio la
 * hace desde el frontend: lee el inventario actual de esa bodega/
 * producto y lo actualiza según el tipo de movimiento.
 */
import { api } from './api.js';

const TYPE_TO_DB = { entrada: 'IN', salida: 'OUT' };
const TYPE_FROM_DB = { IN: 'entrada', OUT: 'salida' };

function fromDb(row) {
  return {
    id: row.id,
    productId: row.product_id,
    warehouseId: row.warehouse_id,
    type: TYPE_FROM_DB[row.movement_type] || row.movement_type,
    quantity: row.quantity,
    date: row.movement_date,
    note: '', // no existe en la BD todavía
  };
}

/** Ajusta la fila de `inventory` de ese producto/bodega según el movimiento. */
async function applyStockChange(productId, warehouseId, type, quantity) {
  const inventory = await api.get(`/inventory/product/${productId}`);
  const record = inventory.find((inv) => String(inv.warehouse_id) === String(warehouseId));
  const currentQty = record ? Number(record.quantity) : 0;
  const delta = type === 'entrada' ? Number(quantity) : -Number(quantity);
  const nextQty = currentQty + delta;

  if (record) {
    await api.put(`/inventory/${record.id}`, {
      warehouse_id: warehouseId, product_id: productId, quantity: nextQty,
    });
  } else {
    await api.post('/inventory', {
      warehouse_id: warehouseId, product_id: productId, quantity: Math.max(nextQty, 0),
    });
  }
}

export const MovementService = {
  getAll: async () => (await api.get('/movements')).map(fromDb),

  getByProduct: async (productId) => (await api.get(`/movements/product/${productId}`)).map(fromDb),

  create: async (movement) => {
    if (movement.type === 'salida') {
      const inventory = await api.get(`/inventory/product/${movement.productId}`);
      const record = inventory.find((inv) => String(inv.warehouse_id) === String(movement.warehouseId));
      const currentQty = record ? Number(record.quantity) : 0;
      if (Number(movement.quantity) > currentQty) {
        throw new Error('La cantidad de salida supera el stock disponible en esa bodega.');
      }
    }

    const created = await api.post('/movements', {
      product_id: movement.productId,
      warehouse_id: movement.warehouseId,
      movement_type: TYPE_TO_DB[movement.type] || movement.type,
      quantity: Number(movement.quantity),
      movement_date: movement.date || new Date().toISOString().slice(0, 10),
    });

    await applyStockChange(movement.productId, movement.warehouseId, movement.type, movement.quantity);
    return fromDb(created);
  },
};
