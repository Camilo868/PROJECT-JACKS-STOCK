/**
 * products.page.js
 * CRUD de productos + cálculo de EOQ y clase ABC en el listado.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import { WarehouseService } from '../services/warehouse.service.js';
import { openFormModal } from '../components/form-modal.js';
import { confirmDialog } from '../components/confirm-dialog.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { calculateEOQ, classifyABC } from '../utils/inventory-calc.js';
import { renderAbcBadge } from '../components/badges.js';
import { formatCurrency, escapeHtml } from '../utils/format.js';

let state = { products: [], suppliers: [], warehouses: [], search: '' };

export async function renderProductsPage(container) {
  const content = renderLayout(container, { title: 'Productos', activePath: '/productos' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;

  await loadData();
  paint(content);
}

async function loadData() {
  const [products, suppliers, warehouses] = await Promise.all([
    ProductService.getAll(),
    SupplierService.getAll(),
    WarehouseService.getAll(),
  ]);
  state = { ...state, products, suppliers, warehouses };
}

function getSupplierName(id) {
  return state.suppliers.find((s) => s.id === id)?.name || '—';
}

function getFilteredProducts() {
  const term = state.search.trim().toLowerCase();
  if (!term) return state.products;
  return state.products.filter((p) =>
    p.name.toLowerCase().includes(term) ||
    p.sku.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term));
}

function paint(content) {
  const filtered = getFilteredProducts();
  const abcMap = classifyABC(state.products);

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Productos</div>
        <div class="sw-page-subtitle">Catálogo, costos y punto de pedido económico (EOQ).</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-product"><i class="bi bi-plus-lg me-1"></i>Nuevo producto</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="input-group" style="max-width:320px;">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" id="product-search" placeholder="Buscar por nombre, SKU o categoría..." value="${escapeHtml(state.search)}">
        </div>
        <div class="small text-secondary">${filtered.length} de ${state.products.length} productos</div>
      </div>

      ${filtered.length === 0 ? `
        <div class="sw-empty-state">
          <i class="bi bi-box-seam"></i>
          <div>No se encontraron productos.</div>
        </div>` : `
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead>
            <tr>
              <th>SKU</th><th>Producto</th><th>Categoría</th><th>Proveedor</th>
              <th>Costo unit.</th><th>Stock</th><th>EOQ</th><th>Clase</th><th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((p) => `
              <tr>
                <td class="text-secondary">${escapeHtml(p.sku)}</td>
                <td class="fw-semibold">${escapeHtml(p.name)}</td>
                <td>${escapeHtml(p.category)}</td>
                <td>${escapeHtml(getSupplierName(p.supplierId))}</td>
                <td>${formatCurrency(p.unitCost)}</td>
                <td>${p.currentStock}</td>
                <td>${calculateEOQ(p)} un.</td>
                <td>${renderAbcBadge(abcMap.get(p.id)?.class || 'C')}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-light" data-action="edit" data-id="${p.id}"><i class="bi bi-pencil-square"></i></button>
                  <button class="btn btn-sm btn-light text-danger" data-action="delete" data-id="${p.id}"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;

  content.querySelector('#btn-new-product').addEventListener('click', () => openProductModal(content));
  content.querySelector('#product-search').addEventListener('input', (e) => {
    state.search = e.target.value;
    paint(content);
  });

  content.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = state.products.find((p) => p.id === btn.dataset.id);
      openProductModal(content, product);
    });
  });

  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const product = state.products.find((p) => p.id === btn.dataset.id);
      const ok = await confirmDialog(`Se eliminará "${product.name}" del catálogo. Esta acción no se puede deshacer.`, 'Eliminar producto');
      if (!ok) return;
      try {
        await ProductService.remove(product.id);
        showSuccess('Producto eliminado correctamente.');
        await loadData();
        paint(content);
      } catch (error) {
        showError(error.message || 'No se pudo eliminar el producto.');
      }
    });
  });
}

function openProductModal(content, product) {
  const isEdit = Boolean(product);
  const supplierOptions = state.suppliers.map((s) => ({ value: s.id, label: s.name }));
  const warehouseOptions = state.warehouses.map((w) => ({ value: w.id, label: w.name }));

  openFormModal({
    title: isEdit ? 'Editar producto' : 'Nuevo producto',
    submitLabel: isEdit ? 'Guardar cambios' : 'Crear producto',
    initialValues: product || { holdingCostRate: 0.2, currentStock: 0, safetyStock: 0 },
    fields: [
      { name: 'sku', label: 'SKU', required: true, colClass: 'col-6' },
      { name: 'name', label: 'Nombre del producto', required: true, colClass: 'col-6' },
      { name: 'category', label: 'Categoría', required: true, colClass: 'col-6' },
      { name: 'supplierId', label: 'Proveedor', type: 'select', required: true, options: supplierOptions, colClass: 'col-6' },
      { name: 'warehouseId', label: 'Bodega', type: 'select', required: true, options: warehouseOptions, colClass: 'col-6' },
      { name: 'unitCost', label: 'Costo unitario (COP)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'annualDemand', label: 'Demanda anual estimada (un.)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'orderingCost', label: 'Costo de ordenar un pedido (COP)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'holdingCostRate', label: 'Tasa de almacenamiento anual (0-1)', type: 'number', min: 0, step: '0.01', required: true, colClass: 'col-6' },
      { name: 'safetyStock', label: 'Stock de seguridad (un.)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'currentStock', label: 'Stock actual (un.)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
    ],
    onSubmit: async (values) => {
      const { valid, errors } = validateForm(values, {
        sku: [validators.required],
        name: [validators.required],
        category: [validators.required],
        supplierId: [validators.required],
        warehouseId: [validators.required],
        unitCost: [validators.required, validators.positiveNumber],
        annualDemand: [validators.required, validators.nonNegativeNumber],
        orderingCost: [validators.required, validators.positiveNumber],
        holdingCostRate: [validators.required, validators.positiveNumber],
      });
      if (!valid) throw new Error(Object.values(errors)[0]);

      const payload = {
        sku: values.sku.trim(),
        name: values.name.trim(),
        category: values.category.trim(),
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        unitCost: Number(values.unitCost),
        annualDemand: Number(values.annualDemand),
        orderingCost: Number(values.orderingCost),
        holdingCostRate: Number(values.holdingCostRate),
        safetyStock: Number(values.safetyStock),
        currentStock: Number(values.currentStock),
      };

      if (isEdit) {
        await ProductService.update(product.id, payload);
        showSuccess('Producto actualizado correctamente.');
      } else {
        await ProductService.create(payload);
        showSuccess('Producto creado correctamente.');
      }

      await loadData();
      paint(content);
    },
  });
}
