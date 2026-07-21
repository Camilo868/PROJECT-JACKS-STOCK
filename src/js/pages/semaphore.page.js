/**
 * semaphore.page.js
 * Product list ordered by purchase urgency (ROP semaphore), with the
 * suggested review frequency based on ABC class.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import {
  calculateROP, getSemaphoreStatus, classifyABC, SEMAPHORE_LABEL, REVIEW_FREQUENCY_LABEL,
} from '../utils/inventory-calc.js';
import { renderSemaphoreBadge, renderAbcBadge } from '../components/badges.js';
import { escapeHtml } from '../utils/format.js';

let filterStatus = '';

export async function renderSemaphorePage(container) {
  const content = renderLayout(container, { title: 'Purchase semaphore', activePath: '/semaphore' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;

  const [products, suppliers] = await Promise.all([ProductService.getAll(), SupplierService.getAll()]);
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const abcMap = classifyABC(products);

  const enriched = products.map((p) => {
    const supplier = supplierMap.get(p.supplierId);
    // Lead time lives on the product (lead_time_days in the real
    // database), not on the supplier, since it can vary per product.
    const rop = calculateROP(p, p.leadTimeDays || 0);
    const status = getSemaphoreStatus(p, rop);
    const abc = abcMap.get(p.id);
    return { ...p, rop, status, abcClass: abc?.class || 'C', supplierName: supplier?.name || '—' };
  });

  paint(content, enriched);
}

function paint(content, enriched) {
  const order = { red: 0, yellow: 1, green: 2 };
  const list = enriched
    .filter((p) => !filterStatus || p.status === filterStatus)
    .sort((a, b) => order[a.status] - order[b.status] || (a.currentStock - a.rop) - (b.currentStock - b.rop));

  const counts = {
    red: enriched.filter((p) => p.status === 'red').length,
    yellow: enriched.filter((p) => p.status === 'yellow').length,
    green: enriched.filter((p) => p.status === 'green').length,
  };

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Purchase semaphore</div>
        <div class="sw-page-subtitle">Prioritize what to buy first based on the reorder point (ROP).</div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-4">
        <button class="sw-card p-3 w-100 text-start border-0" data-filter="red" style="cursor:pointer;">
          <div class="d-flex align-items-center gap-2 mb-1"><span class="sw-dot sw-dot-red"></span><span class="fw-semibold">Buy now</span></div>
          <div class="sw-kpi-value">${counts.red}</div>
        </button>
      </div>
      <div class="col-4">
        <button class="sw-card p-3 w-100 text-start border-0" data-filter="yellow" style="cursor:pointer;">
          <div class="d-flex align-items-center gap-2 mb-1"><span class="sw-dot sw-dot-yellow"></span><span class="fw-semibold">Watch</span></div>
          <div class="sw-kpi-value">${counts.yellow}</div>
        </button>
      </div>
      <div class="col-4">
        <button class="sw-card p-3 w-100 text-start border-0" data-filter="green" style="cursor:pointer;">
          <div class="d-flex align-items-center gap-2 mb-1"><span class="sw-dot sw-dot-green"></span><span class="fw-semibold">Healthy</span></div>
          <div class="sw-kpi-value">${counts.green}</div>
        </button>
      </div>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="small text-secondary">${filterStatus ? `Showing: ${SEMAPHORE_LABEL[filterStatus]}` : 'Showing all products'}</div>
        ${filterStatus ? `<button class="btn btn-sm btn-light" id="clear-filter">Clear filter</button>` : ''}
      </div>
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead><tr><th>Product</th><th>Supplier</th><th>Class</th><th>Stock</th><th>ROP</th><th>Status</th><th>Review frequency</th></tr></thead>
          <tbody>
            ${list.map((p) => `
              <tr class="${p.status === 'red' ? 'sw-row-urgent' : ''}">
                <td>
                  <div class="fw-semibold">${escapeHtml(p.name)}</div>
                  <div class="small text-secondary">${escapeHtml(p.sku)}</div>
                </td>
                <td>${escapeHtml(p.supplierName)}</td>
                <td>${renderAbcBadge(p.abcClass)}</td>
                <td>${p.currentStock}</td>
                <td>${p.rop}</td>
                <td>${renderSemaphoreBadge(p.status, SEMAPHORE_LABEL[p.status])}</td>
                <td class="small text-secondary">${REVIEW_FREQUENCY_LABEL[p.abcClass]}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  content.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterStatus = filterStatus === btn.dataset.filter ? '' : btn.dataset.filter;
      paint(content, enriched);
    });
  });
  content.querySelector('#clear-filter')?.addEventListener('click', () => {
    filterStatus = '';
    paint(content, enriched);
  });
}
