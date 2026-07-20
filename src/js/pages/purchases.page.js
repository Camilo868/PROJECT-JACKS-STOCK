/**
 * purchases.page.js
 * Órdenes de compra manuales. Sugiere cantidad usando el EOQ del
 * producto y, al marcar una orden como recibida, genera automáticamente
 * los movimientos de entrada correspondientes.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import { PurchaseService } from '../services/purchase.service.js';
import { MovementService } from '../services/movement.service.js';
import { confirmDialog } from '../components/confirm-dialog.js';
import { showSuccess, showError } from '../components/toast.js';
import { calculateEOQ } from '../utils/inventory-calc.js';
import { formatCurrency, formatDate, escapeHtml } from '../utils/format.js';

let purchases = [];
let products = [];
let suppliers = [];
let modalEl = null;
let itemRowCount = 0;

const STATUS_META = {
  pendiente: { label: 'Pendiente', class: 'text-bg-warning' },
  recibida: { label: 'Recibida', class: 'text-bg-success' },
  cancelada: { label: 'Cancelada', class: 'text-bg-secondary' },
};

export async function renderPurchasesPage(container) {
  const content = renderLayout(container, { title: 'Órdenes de compra', activePath: '/compras' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;
  await loadData();
  paint(content);
}

async function loadData() {
  [purchases, products, suppliers] = await Promise.all([
    PurchaseService.getAll(), ProductService.getAll(), SupplierService.getAll(),
  ]);
}

const getSupplierName = (id) => suppliers.find((s) => s.id === id)?.name || '—';
const getProductName = (id) => products.find((p) => p.id === id)?.name || 'Producto eliminado';

function paint(content) {
  const sorted = [...purchases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Órdenes de compra</div>
        <div class="sw-page-subtitle">Crea órdenes manuales; la cantidad sugerida se calcula con el EOQ.</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-purchase"><i class="bi bi-plus-lg me-1"></i>Nueva orden de compra</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      ${sorted.length === 0 ? `
        <div class="sw-empty-state"><i class="bi bi-cart-x"></i><div>No hay órdenes de compra registradas.</div></div>` : `
      <div class="accordion" id="purchases-accordion">
        ${sorted.map((order, idx) => {
          const meta = STATUS_META[order.status] || STATUS_META.pendiente;
          return `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button ${idx === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#order-${order.id}">
                <div class="d-flex justify-content-between align-items-center w-100 me-3 flex-wrap gap-2">
                  <div>
                    <span class="fw-semibold">${escapeHtml(getSupplierName(order.supplierId))}</span>
                    <span class="small text-secondary ms-2">${formatDate(order.createdAt)} · ${order.items.length} ítem(s)</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">${formatCurrency(order.total)}</span>
                    <span class="badge ${meta.class}">${meta.label}</span>
                  </div>
                </div>
              </button>
            </h2>
            <div id="order-${order.id}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#purchases-accordion">
              <div class="accordion-body">
                <table class="table sw-table mb-3">
                  <thead><tr><th>Producto</th><th>Cantidad</th><th>Costo unit.</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    ${order.items.map((it) => `
                      <tr>
                        <td>${escapeHtml(getProductName(it.productId))}</td>
                        <td>${it.quantity}</td>
                        <td>${formatCurrency(it.unitCost)}</td>
                        <td>${formatCurrency(it.quantity * it.unitCost)}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>
                <div class="d-flex gap-2 flex-wrap">
                  ${order.status === 'pendiente' ? `
                    <button class="btn btn-sm btn-success" data-action="receive" data-id="${order.id}"><i class="bi bi-check2-circle me-1"></i>Marcar como recibida</button>
                    <button class="btn btn-sm btn-outline-secondary" data-action="cancel" data-id="${order.id}"><i class="bi bi-x-circle me-1"></i>Cancelar orden</button>` : ''}
                  <button class="btn btn-sm btn-light text-danger" data-action="delete" data-id="${order.id}"><i class="bi bi-trash3 me-1"></i>Eliminar</button>
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;

  content.querySelector('#btn-new-purchase').addEventListener('click', () => openPurchaseModal(content));

  content.querySelectorAll('[data-action="receive"]').forEach((btn) => {
    btn.addEventListener('click', () => receiveOrder(content, btn.dataset.id));
  });
  content.querySelectorAll('[data-action="cancel"]').forEach((btn) => {
    btn.addEventListener('click', () => cancelOrder(content, btn.dataset.id));
  });
  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteOrder(content, btn.dataset.id));
  });
}

async function receiveOrder(content, id) {
  const order = purchases.find((o) => o.id === id);
  const ok = await confirmDialog('Se registrarán entradas de inventario por cada ítem de la orden y se marcará como recibida.', 'Recibir orden de compra');
  if (!ok) return;
  try {
    for (const item of order.items) {
      await MovementService.create({
        productId: item.productId,
        type: 'entrada',
        quantity: item.quantity,
        note: `Recepción orden de compra #${order.id}`,
      });
    }
    await PurchaseService.updateStatus(order.id, 'recibida');
    showSuccess('Orden marcada como recibida y stock actualizado.');
    await loadData();
    paint(content);
  } catch (error) {
    showError(error.message || 'No se pudo procesar la recepción.');
  }
}

async function cancelOrder(content, id) {
  const ok = await confirmDialog('La orden de compra se marcará como cancelada.', 'Cancelar orden');
  if (!ok) return;
  await PurchaseService.updateStatus(id, 'cancelada');
  showSuccess('Orden cancelada.');
  await loadData();
  paint(content);
}

async function deleteOrder(content, id) {
  const ok = await confirmDialog('Esta orden de compra se eliminará permanentemente.', 'Eliminar orden');
  if (!ok) return;
  await PurchaseService.remove(id);
  showSuccess('Orden eliminada.');
  await loadData();
  paint(content);
}

/* ------------------------- Modal de nueva orden ------------------------- */

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.className = 'modal fade';
  modalEl.tabIndex = -1;
  document.body.appendChild(modalEl);
  return modalEl;
}

function itemRowTemplate(rowId) {
  const productOptions = products.map((p) => `<option value="${p.id}" data-cost="${p.unitCost}" data-eoq="${calculateEOQ(p)}">${escapeHtml(p.name)}</option>`).join('');
  return `
    <div class="row g-2 align-items-end mb-2 purchase-item-row" data-row="${rowId}">
      <div class="col-6">
        <label class="form-label small mb-1">Producto</label>
        <select class="form-select form-select-sm item-product" required>
          <option value="" disabled selected>Selecciona...</option>
          ${productOptions}
        </select>
      </div>
      <div class="col-3">
        <label class="form-label small mb-1">Cantidad</label>
        <input type="number" min="1" step="1" class="form-control form-control-sm item-quantity" required>
      </div>
      <div class="col-2">
        <label class="form-label small mb-1">Costo unit.</label>
        <input type="text" class="form-control form-control-sm item-cost" disabled>
      </div>
      <div class="col-1 text-end">
        <button type="button" class="btn btn-sm btn-outline-danger remove-row"><i class="bi bi-trash3"></i></button>
      </div>
    </div>`;
}

function openPurchaseModal(content) {
  const el = ensureModal();
  itemRowCount = 0;
  const supplierOptions = suppliers.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');

  el.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Nueva orden de compra</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form id="purchase-form" novalidate>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Proveedor</label>
              <select class="form-select" id="purchase-supplier" required>
                <option value="" disabled selected>Selecciona un proveedor...</option>
                ${supplierOptions}
              </select>
            </div>
            <label class="form-label">Ítems del pedido</label>
            <div id="purchase-items"></div>
            <button type="button" class="btn btn-sm btn-outline-secondary mt-1" id="add-item-row"><i class="bi bi-plus-lg me-1"></i>Agregar ítem</button>
            <div class="alert alert-danger mt-3 d-none" id="purchase-error"></div>
            <div class="text-end fw-bold mt-3 fs-5" id="purchase-total">Total: ${formatCurrency(0)}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn sw-btn-accent">Crear orden</button>
          </div>
        </form>
      </div>
    </div>`;

  const modal = new bootstrap.Modal(el);
  const itemsContainer = el.querySelector('#purchase-items');
  const errorBox = el.querySelector('#purchase-error');
  const totalEl = el.querySelector('#purchase-total');

  function addRow() {
    itemRowCount += 1;
    itemsContainer.insertAdjacentHTML('beforeend', itemRowTemplate(itemRowCount));
  }
  addRow();

  itemsContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-product')) {
      const row = e.target.closest('.purchase-item-row');
      const opt = e.target.selectedOptions[0];
      row.querySelector('.item-cost').value = opt ? formatCurrency(opt.dataset.cost) : '';
      const qtyInput = row.querySelector('.item-quantity');
      if (opt && !qtyInput.value) qtyInput.value = opt.dataset.eoq || 1;
    }
    recalcTotal();
  });
  itemsContainer.addEventListener('input', recalcTotal);

  itemsContainer.addEventListener('click', (e) => {
    if (e.target.closest('.remove-row')) {
      const rows = itemsContainer.querySelectorAll('.purchase-item-row');
      if (rows.length > 1) e.target.closest('.purchase-item-row').remove();
      recalcTotal();
    }
  });

  el.querySelector('#add-item-row').addEventListener('click', addRow);

  function recalcTotal() {
    let total = 0;
    itemsContainer.querySelectorAll('.purchase-item-row').forEach((row) => {
      const opt = row.querySelector('.item-product').selectedOptions[0];
      const qty = Number(row.querySelector('.item-quantity').value) || 0;
      if (opt) total += qty * Number(opt.dataset.cost);
    });
    totalEl.textContent = `Total: ${formatCurrency(total)}`;
  }

  el.querySelector('#purchase-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('d-none');

    const supplierId = el.querySelector('#purchase-supplier').value;
    const rows = [...itemsContainer.querySelectorAll('.purchase-item-row')];
    const items = rows.map((row) => {
      const opt = row.querySelector('.item-product').selectedOptions[0];
      return {
        productId: opt?.value,
        quantity: Number(row.querySelector('.item-quantity').value),
        unitCost: opt ? Number(opt.dataset.cost) : 0,
      };
    });

    if (!supplierId) {
      errorBox.textContent = 'Selecciona un proveedor.';
      errorBox.classList.remove('d-none');
      return;
    }
    if (items.some((it) => !it.productId || !it.quantity || it.quantity <= 0)) {
      errorBox.textContent = 'Completa todos los ítems con producto y cantidad válida.';
      errorBox.classList.remove('d-none');
      return;
    }

    try {
      await PurchaseService.create({ supplierId, items });
      showSuccess('Orden de compra creada correctamente.');
      modal.hide();
      await loadData();
      paint(content);
    } catch (error) {
      errorBox.textContent = error.message || 'No se pudo crear la orden.';
      errorBox.classList.remove('d-none');
    }
  });

  modal.show();
}
