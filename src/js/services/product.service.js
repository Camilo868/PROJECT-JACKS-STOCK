/**
 * product.service.js — Catálogo de productos.
 *
 * ¿POR QUÉ ESTE ARCHIVO ES MÁS LARGO QUE ANTES?
 * La tabla `products` de la base de datos real no tiene la misma forma
 * que usan las pantallas (products.page.js, semaphore.page.js, etc.).
 * Diferencias concretas:
 *
 *   - La BD no guarda "categoría" como texto, sino `category_id`
 *     (un número que apunta a la tabla `categories`).
 *   - La BD no guarda el stock dentro de products: vive en la tabla
 *     `inventory`, separada por bodega. Un producto puede tener stock
 *     en varias bodegas a la vez.
 *   - La BD no tiene columna `sku` ni `safety_stock`. Se generan/asumen
 *     acá mientras el equipo decide si se agregan esas columnas.
 *   - `holding_cost` en la BD es un valor absoluto (costo de guardar
 *     1 unidad al año, en pesos), mientras que las pantallas trabajan
 *     con una TASA (0 a 1). Se convierte en los dos sentidos.
 *   - `lead_time_days` vive en products (no en suppliers, como asumía
 *     el mock original) — cada producto puede tener un proveedor con
 *     un tiempo de entrega distinto.
 *
 * Este archivo hace de "traductor": las páginas siguen recibiendo el
 * mismo objeto "bonito" de antes (sku, category, unitCost,
 * holdingCostRate, currentStock...), pero por debajo habla con la BD
 * real usando sus nombres y tablas (category_id, unit_price,
 * holding_cost, inventory...).
 */
import { api } from './api.js';
import { CategoryService } from './category.service.js';

/** Genera un SKU de exhibición ya que la BD no guarda uno. */
function fakeSku(id) {
  return `PRD-${String(id).padStart(4, '0')}`;
}

/** Convierte una fila cruda de `products` (BD) al objeto que usan las páginas. */
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
    // holding_cost (BD) es un valor absoluto; las páginas usan una tasa.
    holdingCostRate: unitCost ? holdingCost / unitCost : 0,
    leadTimeDays: Number(row.lead_time_days) || 0,
    // La BD no tiene safety_stock todavía: queda en 0 hasta que se agregue
    // esa columna (ver README-backend).
    safetyStock: 0,
    currentStock: totalStock,
    stockByWarehouse, // [{ inventoryId, warehouseId, quantity }] — detalle por bodega
  };
}

/** Convierte el objeto "bonito" del formulario a lo que espera products (BD). */
function toDb(payload) {
  const unitCost = Number(payload.unitCost) || 0;
  const rate = Number(payload.holdingCostRate) || 0;
  const annualDemand = Number(payload.annualDemand) || 0;

  return {
    category_id: payload.categoryId,
    supplier_id: payload.supplierId,
    name: payload.name,
    description: payload.description || '',
    unit_price: unitCost,
    annual_demand: annualDemand,
    ordering_cost: Number(payload.orderingCost) || 0,
    // Se convierte la tasa de vuelta a un valor absoluto para la BD.
    holding_cost: Math.round(unitCost * rate),
    lead_time_days: Number(payload.leadTimeDays) || 0,
    daily_demand: Math.round((annualDemand / 365) * 100) / 100,
  };
}

/** Trae todo lo necesario para armar la lista de productos ya "traducida". */
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
 * Crea o actualiza el registro de stock del producto en una bodega
 * (tabla `inventory`). Si ya existía un registro para esa bodega, lo
 * actualiza; si no, crea uno nuevo.
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
