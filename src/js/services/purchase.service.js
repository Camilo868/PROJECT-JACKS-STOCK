/**
 * purchase.service.js — Órdenes de compra.
 *
 * La BD real separa esto en DOS tablas:
 *   - `purchases`: id, supplier_id, purchase_date, total, status
 *   - `purchase_details`: cada artículo de esa compra (product_id,
 *     quantity, unit_price), enlazado por purchase_id
 *
 * El backend ya tiene la columna `status` (ver migrations.sql) y el
 * endpoint PATCH /purchases/:id/status, así que ya no hace falta el
 * parche de localStorage que se usaba antes.
 */
import { api } from './api.js';

async function attachDetails(row) {
  const details = await api.get(`/purchase-details/purchase/${row.id}`);
  return {
    id: row.id,
    supplierId: row.supplier_id,
    createdAt: row.purchase_date,
    total: Number(row.total) || 0,
    status: row.status || 'pendiente',
    items: details.map((d) => ({
      productId: d.product_id,
      quantity: d.quantity,
      unitCost: Number(d.unit_price) || 0,
    })),
  };
}

export const PurchaseService = {
  getAll: async () => {
    const rows = await api.get('/purchases');
    return Promise.all(rows.map(attachDetails));
  },

  getById: async (id) => attachDetails(await api.get(`/purchases/${id}`)),

  create: async (order) => {
    const total = order.items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
    const created = await api.post('/purchases', {
      supplier_id: order.supplierId,
      purchase_date: new Date().toISOString().slice(0, 10),
      total,
      status: 'pendiente',
    });

    await Promise.all(order.items.map((it) => api.post('/purchase-details', {
      purchase_id: created.id,
      product_id: it.productId,
      quantity: it.quantity,
      unit_price: it.unitCost,
    })));

    return created;
  },

  updateStatus: (id, status) => api.patch(`/purchases/${id}/status`, { status }),

  remove: (id) => api.delete(`/purchases/${id}`),
};
