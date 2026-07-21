/**
 * movements.page.js
 * Inventory entries/exits log and per-product history.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { WarehouseService } from '../services/warehouse.service.js';
import { MovementService } from '../services/movement.service.js';
import { openFormModal } from '../components/form-modal.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { formatDateTime, escapeHtml } from '../utils/format.js';

let products = [];
let warehouses = [];
let movements = [];
let filterProductId = '';

export async function renderMovementsPage(container) {
  const content = renderLayout(container, { title: 'Movements', activePath: '/movements' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;
  await loadData();
  paint(content);
}

async function loadData() {
  [products, warehouses, movements] = await Promise.all([
    ProductService.getAll(), WarehouseService.getAll(), MovementService.getAll(),
  ]);
}

function getProduct(id) {
  return products.find((p) => String(p.id) === String(id));
}

function getWarehouseName(id) {
  return warehouses.find((w) => String(w.id) === String(id))?.name || '—';
}

function filteredMovements() {
  const list = filterProductId
    ? movements.filter((m) => String(m.productId) === String(filterProductId))
    : movements;
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function paint(content) {
  const list = filteredMovements();
  const productOptions = products.map((p) => `<option value="${p.id}" ${String(filterProductId) === String(p.id) ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Inventory movements</div>
        <div class="sw-page-subtitle">Entry and exit history per product.</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-movement"><i class="bi bi-plus-lg me-1"></i>Log movement</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div style="max-width:320px;" class="w-100">
          <select class="form-select" id="movement-filter">
            <option value="">All products</option>
            ${productOptions}
          </select>
        </div>
        <div class="small text-secondary">${list.length} movement(s)</div>
      </div>

      ${list.length === 0 ? `
        <div class="sw-empty-state"><i class="bi bi-arrow-left-right"></i><div>No movements match this filter.</div></div>` : `
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead><tr><th>Date</th><th>Product</th><th>Warehouse</th><th>Type</th><th>Quantity</th><th>Note</th></tr></thead>
          <tbody>
            ${list.map((m) => {
              const product = getProduct(m.productId);
              const isEntry = m.type === 'in';
              return `
              <tr>
                <td class="text-secondary">${formatDateTime(m.date)}</td>
                <td class="fw-semibold">${escapeHtml(product?.name || 'Deleted product')}</td>
                <td>${escapeHtml(getWarehouseName(m.warehouseId))}</td>
                <td><span class="badge ${isEntry ? 'text-bg-success' : 'text-bg-danger'} bg-opacity-75">${isEntry ? 'Entry' : 'Exit'}</span></td>
                <td>${m.quantity} un.</td>
                <td class="text-secondary">${escapeHtml(m.note || '—')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;

  content.querySelector('#btn-new-movement').addEventListener('click', () => openMovementModal(content));
  content.querySelector('#movement-filter').addEventListener('change', (e) => {
    filterProductId = e.target.value;
    paint(content);
  });
}

function openMovementModal(content) {
  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (total stock: ${p.currentStock})` }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  openFormModal({
    title: 'Log movement',
    submitLabel: 'Log',
    initialValues: { type: 'in' },
    fields: [
      { name: 'productId', label: 'Product', type: 'select', required: true, options: productOptions },
      // Warehouse is required: the database tracks stock per
      // warehouse, not a single total per product.
      { name: 'warehouseId', label: 'Warehouse', type: 'select', required: true, options: warehouseOptions },
      {
        name: 'type', label: 'Movement type', type: 'select', required: true,
        options: [{ value: 'in', label: 'Entry' }, { value: 'out', label: 'Exit' }],
        colClass: 'col-6',
      },
      { name: 'quantity', label: 'Quantity', type: 'number', min: 1, step: '1', required: true, colClass: 'col-6' },
      { name: 'note', label: 'Note (optional)', type: 'textarea' },
    ],
    onSubmit: async (values) => {
      const { valid, errors } = validateForm(values, {
        productId: [validators.required],
        warehouseId: [validators.required],
        type: [validators.required],
        quantity: [validators.required, validators.positiveNumber],
      });
      if (!valid) throw new Error(Object.values(errors)[0]);

      try {
        await MovementService.create({
          productId: values.productId,
          warehouseId: values.warehouseId,
          type: values.type,
          quantity: Number(values.quantity),
          note: values.note?.trim() || '',
        });
      } catch (error) {
        throw new Error(error.message);
      }

      showSuccess('Movement logged successfully.');
      await loadData();
      paint(content);
    },
  });
}
