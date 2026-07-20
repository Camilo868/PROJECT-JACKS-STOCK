/**
 * movements.page.js
 * Registro de entradas/salidas de inventario e historial por producto.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { MovementService } from '../services/movement.service.js';
import { openFormModal } from '../components/form-modal.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { formatDateTime, escapeHtml } from '../utils/format.js';

let products = [];
let movements = [];
let filterProductId = '';

export async function renderMovementsPage(container) {
  const content = renderLayout(container, { title: 'Movimientos', activePath: '/movimientos' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;
  await loadData();
  paint(content);
}

async function loadData() {
  [products, movements] = await Promise.all([ProductService.getAll(), MovementService.getAll()]);
}

function getProduct(id) {
  return products.find((p) => p.id === id);
}

function filteredMovements() {
  const list = filterProductId ? movements.filter((m) => m.productId === filterProductId) : movements;
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function paint(content) {
  const list = filteredMovements();
  const productOptions = products.map((p) => `<option value="${p.id}" ${filterProductId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Movimientos de inventario</div>
        <div class="sw-page-subtitle">Historial de entradas y salidas por producto.</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-movement"><i class="bi bi-plus-lg me-1"></i>Registrar movimiento</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div style="max-width:320px;" class="w-100">
          <select class="form-select" id="movement-filter">
            <option value="">Todos los productos</option>
            ${productOptions}
          </select>
        </div>
        <div class="small text-secondary">${list.length} movimiento(s)</div>
      </div>

      ${list.length === 0 ? `
        <div class="sw-empty-state"><i class="bi bi-arrow-left-right"></i><div>No hay movimientos registrados para este filtro.</div></div>` : `
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Nota</th></tr></thead>
          <tbody>
            ${list.map((m) => {
              const product = getProduct(m.productId);
              const isEntry = m.type === 'entrada';
              return `
              <tr>
                <td class="text-secondary">${formatDateTime(m.date)}</td>
                <td class="fw-semibold">${escapeHtml(product?.name || 'Producto eliminado')}</td>
                <td><span class="badge ${isEntry ? 'text-bg-success' : 'text-bg-danger'} bg-opacity-75">${isEntry ? 'Entrada' : 'Salida'}</span></td>
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
  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (stock: ${p.currentStock})` }));

  openFormModal({
    title: 'Registrar movimiento',
    submitLabel: 'Registrar',
    initialValues: { type: 'entrada' },
    fields: [
      { name: 'productId', label: 'Producto', type: 'select', required: true, options: productOptions },
      {
        name: 'type', label: 'Tipo de movimiento', type: 'select', required: true,
        options: [{ value: 'entrada', label: 'Entrada' }, { value: 'salida', label: 'Salida' }],
        colClass: 'col-6',
      },
      { name: 'quantity', label: 'Cantidad', type: 'number', min: 1, step: '1', required: true, colClass: 'col-6' },
      { name: 'note', label: 'Nota (opcional)', type: 'textarea' },
    ],
    onSubmit: async (values) => {
      const { valid, errors } = validateForm(values, {
        productId: [validators.required],
        type: [validators.required],
        quantity: [validators.required, validators.positiveNumber],
      });
      if (!valid) throw new Error(Object.values(errors)[0]);

      try {
        await MovementService.create({
          productId: values.productId,
          type: values.type,
          quantity: Number(values.quantity),
          note: values.note?.trim() || '',
        });
      } catch (error) {
        throw new Error(error.message);
      }

      showSuccess('Movimiento registrado correctamente.');
      await loadData();
      paint(content);
    },
  });
}
