/**
 * movement.service.js — Stock entries and exits.
 *
 * Differences from the raw database:
 *   - The database uses `movement_type` with 'IN' / 'OUT' values, not
 *     'entrada' / 'salida'. Translated both ways below.
 *   - A movement always belongs to ONE warehouse (stock is tracked per
 *     warehouse in `inventory`), so `warehouseId` is required.
 *   - `date` (UI) is `movement_date` (DB).
 *
 * Registering a movement must also update the real stock in
 * `inventory`. The backend doesn't do that automatically yet, so this
 * service does it here: it reads current stock for that
 * product/warehouse and adjusts it based on the movement type.
 */
import { api } from './api.js';

const TYPE_TO_DB = { in: 'IN', out: 'OUT' };
const TYPE_FROM_DB = { IN: 'in', OUT: 'out' };

function fromDb(row) {
  return {
    id: row.id,
    productId: row.product_id,
    warehouseId: row.warehouse_id,
    type: TYPE_FROM_DB[row.movement_type] || row.movement_type,
    quantity: row.quantity,
    date: row.movement_date,
    note: row.note || '',
  };
}

/** Adjusts the `inventory` row for that product/warehouse based on the movement. */
async function applyStockChange(productId, warehouseId, type, quantity) {
  const inventory = await api.get(`/inventory/product/${productId}`);
  const record = inventory.find((inv) => String(inv.warehouse_id) === String(warehouseId));
  const currentQty = record ? Number(record.quantity) : 0;
  const delta = type === 'in' ? Number(quantity) : -Number(quantity);
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
    if (movement.type === 'out') {
      const inventory = await api.get(`/inventory/product/${movement.productId}`);
      const record = inventory.find((inv) => String(inv.warehouse_id) === String(movement.warehouseId));
      const currentQty = record ? Number(record.quantity) : 0;
      if (Number(movement.quantity) > currentQty) {
        throw new Error('The exit quantity is greater than the available stock in that warehouse.');
      }
    }

    const created = await api.post('/movements', {
      product_id: movement.productId,
      warehouse_id: movement.warehouseId,
      movement_type: TYPE_TO_DB[movement.type] || movement.type,
      quantity: Number(movement.quantity),
      movement_date: movement.date || new Date().toISOString().slice(0, 10),
      note: movement.note || null,
    });

    await applyStockChange(movement.productId, movement.warehouseId, movement.type, movement.quantity);
    return fromDb(created);
  },
};
