/**
 * products.page.js
 * Product CRUD + EOQ calculation and ABC class in the listing.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import { WarehouseService } from '../services/warehouse.service.js';
import { CategoryService } from '../services/category.service.js';
import { SettingsService } from '../services/settings.service.js';
import { openFormModal } from '../components/form-modal.js';
import { confirmDialog } from '../components/confirm-dialog.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { calculateEOQ, classifyABC } from '../utils/inventory-calc.js';
import { renderAbcBadge } from '../components/badges.js';
import { formatCurrency, escapeHtml } from '../utils/format.js';

let state = { products: [], suppliers: [], warehouses: [], categories: [], search: '' };

export async function renderProductsPage(container) {
  const content = renderLayout(container, { title: 'Products', activePath: '/products' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;

  await loadData();
  paint(content);
}

async function loadData() {
  const [products, suppliers, warehouses, categories] = await Promise.all([
    ProductService.getAll(),
    SupplierService.getAll(),
    WarehouseService.getAll(),
    CategoryService.getAll(),
  ]);
  state = { ...state, products, suppliers, warehouses, categories };
}

function getSupplierName(id) {
  return state.suppliers.find((s) => String(s.id) === String(id))?.name || '—';
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
        <div class="sw-page-title">Products</div>
        <div class="sw-page-subtitle">Catalog, costs and Economic Order Quantity (EOQ).</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-product"><i class="bi bi-plus-lg me-1"></i>New product</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="input-group" style="max-width:320px;">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" id="product-search" placeholder="Search by name, SKU or category..." value="${escapeHtml(state.search)}">
        </div>
        <div class="small text-secondary">${filtered.length} of ${state.products.length} products</div>
      </div>

      ${filtered.length === 0 ? `
        <div class="sw-empty-state">
          <i class="bi bi-box-seam"></i>
          <div>No products found.</div>
        </div>` : `
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead>
            <tr>
              <th>SKU</th><th>Product</th><th>Category</th><th>Supplier</th>
              <th>Unit cost</th><th>Stock</th><th>EOQ</th><th>Class</th><th class="text-end">Actions</th>
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
      // IDs coming from the DOM are always strings; product IDs from
      // the real database are numbers — compare as strings so the
      // lookup actually matches.
      const product = state.products.find((p) => String(p.id) === String(btn.dataset.id));
      openProductModal(content, product);
    });
  });

  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const product = state.products.find((p) => String(p.id) === String(btn.dataset.id));
      if (!product) return;
      const ok = await confirmDialog(`"${product.name}" and its related stock, movement, and purchase records will be permanently deleted. This cannot be undone.`, 'Delete product');
      if (!ok) return;
      try {
        await ProductService.remove(product.id);
        showSuccess('Product deleted successfully.');
        await loadData();
        paint(content);
      } catch (error) {
        showError(error.message || 'Could not delete the product.');
      }
    });
  });
}

function openProductModal(content, product) {
  const isEdit = Boolean(product);
  const supplierOptions = state.suppliers.map((s) => ({ value: s.id, label: s.name }));
  const warehouseOptions = state.warehouses.map((w) => ({ value: w.id, label: w.name }));
  const categoryOptions = state.categories.map((c) => ({ value: c.id, label: c.name }));

  // Initial warehouse/stock: if the product already has inventory in
  // some warehouse, preselect the first one for editing.
  const primaryStock = product?.stockByWarehouse?.[0];

  openFormModal({
    title: isEdit ? 'Edit product' : 'New product',
    submitLabel: isEdit ? 'Save changes' : 'Create product',
    initialValues: product
      ? { ...product, warehouseId: primaryStock?.warehouseId, currentStock: primaryStock?.quantity ?? 0 }
      : {
          // Default holding cost comes from Settings, set freely by
          // the administrator/client as a whole number. Used as-is,
          // with no conversion.
          holdingCost: SettingsService.get().defaultHoldingCost,
          currentStock: 0,
          leadTimeDays: 5,
        },
    fields: [
      { name: 'name', label: 'Product name', required: true, colClass: 'col-6' },
      { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions, colClass: 'col-6' },
      { name: 'supplierId', label: 'Supplier', type: 'select', required: true, options: supplierOptions, colClass: 'col-6' },
      { name: 'leadTimeDays', label: 'Supplier lead time (days)', type: 'number', min: 1, step: '1', required: true, colClass: 'col-6' },
      { name: 'unitCost', label: 'Unit cost (COP)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'annualDemand', label: 'Estimated annual demand (un.)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'orderingCost', label: 'Cost of placing an order (COP)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'holdingCost', label: 'Holding cost (per unit/year)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
      { name: 'warehouseId', label: 'Warehouse (initial/current stock)', type: 'select', required: true, options: warehouseOptions, colClass: 'col-6' },
      { name: 'currentStock', label: 'Stock in that warehouse (un.)', type: 'number', min: 0, step: '1', required: true, colClass: 'col-6' },
    ],
    onSubmit: async (values) => {
      const { valid, errors } = validateForm(values, {
        name: [validators.required],
        categoryId: [validators.required],
        supplierId: [validators.required],
        leadTimeDays: [validators.required, validators.positiveNumber],
        warehouseId: [validators.required],
        unitCost: [validators.required, validators.positiveNumber],
        annualDemand: [validators.required, validators.nonNegativeNumber],
        orderingCost: [validators.required, validators.positiveNumber],
        holdingCost: [validators.required, validators.integer, validators.nonNegativeNumber],
      });
      if (!valid) throw new Error(Object.values(errors)[0]);

      const payload = {
        name: values.name.trim(),
        categoryId: values.categoryId,
        supplierId: values.supplierId,
        leadTimeDays: Number(values.leadTimeDays),
        unitCost: Number(values.unitCost),
        annualDemand: Number(values.annualDemand),
        orderingCost: Number(values.orderingCost),
        holdingCost: Number(values.holdingCost),
        warehouseId: values.warehouseId,
        currentStock: Number(values.currentStock),
        stockByWarehouse: product?.stockByWarehouse || [],
      };

      if (isEdit) {
        await ProductService.update(product.id, payload);
        showSuccess('Product updated successfully.');
      } else {
        await ProductService.create(payload);
        showSuccess('Product created successfully.');
      }

      await loadData();
      paint(content);
    },
  });
}
