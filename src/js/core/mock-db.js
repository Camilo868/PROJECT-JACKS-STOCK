/**
 * mock-db.js
 * Simula la persistencia de un backend REST usando localStorage,
 * mientras el equipo de Backend (Express.js) desarrolla la API real.
 *
 * Estructura de datos alineada con las Historias de Usuario del proyecto
 * (Catálogo, Movimientos, Compras). Cuando el backend esté disponible,
 * basta con desactivar MOCK_MODE en api.js — ningún servicio ni página
 * necesita cambiar, ya que todos consumen exclusivamente api.js.
 */

const PREFIX = 'stockwise_';

function readCollection(name) {
  const raw = localStorage.getItem(PREFIX + name);
  return raw ? JSON.parse(raw) : [];
}

function writeCollection(name, data) {
  localStorage.setItem(PREFIX + name, JSON.stringify(data));
}

export function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const db = {
  list(collection) {
    return readCollection(collection);
  },
  find(collection, predicate) {
    return readCollection(collection).find(predicate) || null;
  },
  filter(collection, predicate) {
    return readCollection(collection).filter(predicate);
  },
  insert(collection, record) {
    const items = readCollection(collection);
    const newRecord = { id: generateId(), createdAt: new Date().toISOString(), ...record };
    items.push(newRecord);
    writeCollection(collection, items);
    return newRecord;
  },
  update(collection, id, patch) {
    const items = readCollection(collection);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...patch, updatedAt: new Date().toISOString() };
    writeCollection(collection, items);
    return items[index];
  },
  remove(collection, id) {
    const items = readCollection(collection);
    const next = items.filter((item) => item.id !== id);
    writeCollection(collection, next);
    return next.length !== items.length;
  },
  isSeeded() {
    return localStorage.getItem(PREFIX + 'seeded') === 'true';
  },
  markSeeded() {
    localStorage.setItem(PREFIX + 'seeded', 'true');
  },
};

/** Carga datos de ejemplo la primera vez que se ejecuta la aplicación. */
export function seedDatabase() {
  if (db.isSeeded()) return;

  writeCollection('users', [
    {
      id: generateId(),
      name: 'Administrador Bodega',
      email: 'admin@stockwise.com',
      password: 'admin123',
      role: 'encargado',
      createdAt: new Date().toISOString(),
    },
  ]);

  const suppliers = [
    { name: 'Distribuidora Andina S.A.S', contact: 'Laura Gómez', email: 'ventas@andina.com', phone: '3001234567', leadTimeDays: 7 },
    { name: 'Comercial del Caribe', contact: 'Jorge Pérez', email: 'contacto@caribe.com', phone: '3009876543', leadTimeDays: 4 },
    { name: 'Insumos Industriales SAS', contact: 'Mónica Ruiz', email: 'pedidos@insumosind.com', phone: '3015551234', leadTimeDays: 12 },
  ].map((s) => ({ id: generateId(), createdAt: new Date().toISOString(), ...s }));
  writeCollection('suppliers', suppliers);

  const warehouses = [
    { name: 'Bodega Principal', location: 'Zona Industrial Norte' },
    { name: 'Bodega Sur', location: 'Barrio San José' },
  ].map((w) => ({ id: generateId(), createdAt: new Date().toISOString(), ...w }));
  writeCollection('warehouses', warehouses);

  const products = [
    { sku: 'PRD-001', name: 'Tornillo hexagonal 1/2"', category: 'Ferretería', supplierId: suppliers[0].id, warehouseId: warehouses[0].id, unitCost: 350, annualDemand: 18000, orderingCost: 45000, holdingCostRate: 0.22, safetyStock: 300, currentStock: 620 },
    { sku: 'PRD-002', name: 'Cable eléctrico THHN 12 AWG (m)', category: 'Eléctrico', supplierId: suppliers[2].id, warehouseId: warehouses[0].id, unitCost: 2100, annualDemand: 9600, orderingCost: 60000, holdingCostRate: 0.20, safetyStock: 150, currentStock: 210 },
    { sku: 'PRD-003', name: 'Pintura acrílica blanca 1 gal', category: 'Pinturas', supplierId: suppliers[1].id, warehouseId: warehouses[1].id, unitCost: 48000, annualDemand: 1200, orderingCost: 55000, holdingCostRate: 0.25, safetyStock: 20, currentStock: 18 },
    { sku: 'PRD-004', name: 'Guantes de nitrilo (caja x100)', category: 'Seguridad Industrial', supplierId: suppliers[2].id, warehouseId: warehouses[0].id, unitCost: 32000, annualDemand: 2400, orderingCost: 40000, holdingCostRate: 0.18, safetyStock: 30, currentStock: 55 },
    { sku: 'PRD-005', name: 'Tubo PVC 1/2" x 6m', category: 'Plomería', supplierId: suppliers[0].id, warehouseId: warehouses[1].id, unitCost: 9800, annualDemand: 3600, orderingCost: 50000, holdingCostRate: 0.20, safetyStock: 40, currentStock: 33 },
    { sku: 'PRD-006', name: 'Cinta aislante negra', category: 'Eléctrico', supplierId: suppliers[2].id, warehouseId: warehouses[0].id, unitCost: 1500, annualDemand: 7200, orderingCost: 30000, holdingCostRate: 0.15, safetyStock: 100, currentStock: 480 },
    { sku: 'PRD-007', name: 'Bombillo LED 9W', category: 'Eléctrico', supplierId: suppliers[1].id, warehouseId: warehouses[1].id, unitCost: 6500, annualDemand: 4800, orderingCost: 35000, holdingCostRate: 0.20, safetyStock: 60, currentStock: 52 },
    { sku: 'PRD-008', name: 'Candado de seguridad 50mm', category: 'Ferretería', supplierId: suppliers[0].id, warehouseId: warehouses[0].id, unitCost: 15000, annualDemand: 900, orderingCost: 42000, holdingCostRate: 0.22, safetyStock: 15, currentStock: 40 },
  ].map((p) => ({ id: generateId(), createdAt: new Date().toISOString(), ...p }));
  writeCollection('products', products);

  const today = new Date();
  const daysAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString();
  const movements = [
    { productId: products[0].id, type: 'entrada', quantity: 500, note: 'Compra inicial', date: daysAgo(20) },
    { productId: products[0].id, type: 'salida', quantity: 180, note: 'Consumo obra Torre Norte', date: daysAgo(6) },
    { productId: products[2].id, type: 'entrada', quantity: 40, note: 'Reposición proveedor', date: daysAgo(15) },
    { productId: products[2].id, type: 'salida', quantity: 22, note: 'Venta mostrador', date: daysAgo(2) },
    { productId: products[4].id, type: 'salida', quantity: 15, note: 'Proyecto plomería', date: daysAgo(1) },
  ].map((m) => ({ id: generateId(), createdAt: m.date, ...m }));
  writeCollection('movements', movements);

  writeCollection('purchases', [
    {
      id: generateId(),
      createdAt: daysAgo(3),
      supplierId: suppliers[1].id,
      status: 'pendiente',
      items: [{ productId: products[2].id, quantity: 60, unitCost: 48000 }],
      total: 60 * 48000,
    },
  ]);

  db.markSeeded();
}
