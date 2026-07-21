/**
 * product.service.js — Product catalog.
 *
 * WHY IS THIS FILE LONGER THAN BEFORE?
 * The real database's `products` table doesn't have the same shape
 * the screens use (products.page.js, semaphore.page.js, etc.).
 * Concrete differences:
 *
 *   - The DB doesn't store "category" as text, only `category_id`
 *     (a number pointing to the `categories` table).
 *   - The DB doesn't store stock inside products: it lives in the
 *     `inventory` table, split per warehouse. A product can have
 *     stock in several warehouses at once.
 *   - The DB has no `sku` or `safety_stock` column. Generated/assumed
 *     here until the team decides whether to add those columns.
 *   - `holding_cost` in the DB is an absolute value (cost of storing
 *     1 unit for a year, in the local currency), set directly by the
 *     administrator. No conversion happens — the number they enter is
 *     stored and read back as-is.
 *   - `lead_time_days` lives on products (not on suppliers, as the
 *     original mock assumed) — each product can have a different
 *     lead time depending on its supplier.
 *
 * This file acts as a "translator": pages keep receiving the same
 * "nice" object as before (sku, category, unitCost, holdingCost,
 * currentStock...), while underneath it talks to the real DB using
 * its own names and tables (category_id, unit_price, holding_cost,
 * inventory...).
 */
import { api } from './api.js';
import { CategoryService } from './category.service.js';

/** Generates a display SKU since the DB doesn't store one. */
function fakeSku(id) {
  return `PRD-${String(id).padStart(4, '0')}`;
}

/** Converts a raw `products` row (DB) into the object the pages use. */
function fromDb(row, { categoryName = '—', stockByWarehouse = [] } = {}) {
  const totalStock = stockByWarehouse.reduce((sum, inv) => sum + Number(inv.quantity || 0), 0);
  const unitCost = Number(row.unit_price) || 0;
  const holdingCost = Number(row.holding_cost) || 0;

  return {
    id: row.id,
    sku: fakeSku(row.id),
    name: row.name,
    description: row.description || '',
    categoryId: row.category_id,
    category: categoryName,
    supplierId: row.supplier_id,
    unitCost,
    annualDemand: Number(row.annual_demand) || 0,
    orderingCost: Number(row.ordering_cost) || 0,
    // Set directly by the administrator; stored as-is (matches the
    // DB's holding_cost column, an absolute number, not a rate).
    holdingCost,
    leadTimeDays: Number(row.lead_time_days) || 0,
    // The DB has no safety_stock column yet: stays 0 until that
    // column is added (see backend README).
    safetyStock: 0,
    currentStock: totalStock,
    stockByWarehouse, // [{ inventoryId, warehouseId, quantity }] — per-warehouse detail
  };
}

/** Converts the form's "nice" object into what products (DB) expects. */
function toDb(payload) {
  const unitCost = Number(payload.unitCost) || 0;
  const annualDemand = Number(payload.annualDemand) || 0;

  return {
    category_id: payload.categoryId,
    supplier_id: payload.supplierId,
    name: payload.name,
    description: payload.description || '',
    unit_price: unitCost,
    annual_demand: annualDemand,
    ordering_cost: Number(payload.orderingCost) || 0,
    // Set directly by the administrator — no conversion needed.
    holding_cost: Number(payload.holdingCost) || 0,
    lead_time_days: Number(payload.leadTimeDays) || 0,
    daily_demand: Math.round((annualDemand / 365) * 100) / 100,
  };
}

/** Fetches everything needed to build the already-"translated" product list. */
async function fetchEnrichedProducts() {
  const [rows, categories, inventory] = await Promise.all([
    api.get('/products'),
    CategoryService.getAll(),
    api.get('/inventory'),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return rows.map((row) => {
    const stockByWarehouse = inventory
      .filter((inv) => inv.product_id === row.id)
      .map((inv) => ({ inventoryId: inv.id, warehouseId: inv.warehouse_id, quantity: inv.quantity }));
    return fromDb(row, { categoryName: categoryMap.get(row.category_id) || '—', stockByWarehouse });
  });
}

/**
 * Creates or updates the product's stock record in a warehouse
 * (`inventory` table). Updates the existing record for that
 * warehouse if there is one, otherwise creates a new one.
 */
async function upsertStock(productId, warehouseId, quantity, existingStock = []) {
  if (!warehouseId) return;
  const existing = existingStock.find((s) => String(s.warehouseId) === String(warehouseId));
  if (existing) {
    await api.put(`/inventory/${existing.inventoryId}`, {
      warehouse_id: warehouseId,
      product_id: productId,
      quantity: Number(quantity) || 0,
    });
  } else {
    await api.post('/inventory', {
      warehouse_id: warehouseId,
      product_id: productId,
      quantity: Number(quantity) || 0,
    });
  }
}

export const ProductService = {
  getAll: () => fetchEnrichedProducts(),

  getById: async (id) => {
    const [row, categories, inventory] = await Promise.all([
      api.get(`/products/${id}`),
      CategoryService.getAll(),
      api.get(`/inventory/product/${id}`),
    ]);
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const stockByWarehouse = inventory.map((inv) => ({
      inventoryId: inv.id, warehouseId: inv.warehouse_id, quantity: inv.quantity,
    }));
    return fromDb(row, { categoryName: categoryMap.get(row.category_id) || '—', stockByWarehouse });
  },

  create: async (product) => {
    const created = await api.post('/products', toDb(product));
    await upsertStock(created.id, product.warehouseId, product.currentStock);
    return created;
  },

  update: async (id, product) => {
    const updated = await api.put(`/products/${id}`, toDb(product));
    await upsertStock(id, product.warehouseId, product.currentStock, product.stockByWarehouse || []);
    return updated;
  },

  remove: (id) => api.delete(`/products/${id}`),
};
