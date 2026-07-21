/**
 * dashboard.page.js
 * Main panel: KPIs, summarized semaphore, quick actions and recent
 * activity.
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import { MovementService } from '../services/movement.service.js';
import { PurchaseService } from '../services/purchase.service.js';
import { calculateROP, getSemaphoreStatus, classifyABC, SEMAPHORE_LABEL } from '../utils/inventory-calc.js';
import { renderSemaphoreBadge, renderAbcBadge } from '../components/badges.js';
import { formatCurrency, formatDateTime, escapeHtml } from '../utils/format.js';

export async function renderDashboardPage(container) {
  const content = renderLayout(container, { title: 'Dashboard', activePath: '/dashboard' });

  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;

  const [products, suppliers, movements, purchases] = await Promise.all([
    ProductService.getAll(),
    SupplierService.getAll(),
    MovementService.getAll(),
    PurchaseService.getAll(),
  ]);

  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const abcMap = classifyABC(products);

  const enriched = products.map((p) => {
    const supplier = supplierMap.get(p.supplierId);
    // Lead time lives on the product (lead_time_days), not on the supplier.
    const rop = calculateROP(p, p.leadTimeDays || 0);
    const status = getSemaphoreStatus(p, rop);
    const abc = abcMap.get(p.id);
    return { ...p, rop, status, abcClass: abc?.class || 'C' };
  });

  const totalValue = products.reduce((sum, p) => sum + p.unitCost * p.currentStock, 0);
  const redCount = enriched.filter((p) => p.status === 'red').length;
  const yellowCount = enriched.filter((p) => p.status === 'yellow').length;
  const pendingPurchases = purchases.filter((p) => p.status === 'pending').length;

  const urgentProducts = enriched
    .filter((p) => p.status !== 'green')
    .sort((a, b) => (a.currentStock - a.rop) - (b.currentStock - b.rop))
    .slice(0, 5);

  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const productMap = new Map(products.map((p) => [p.id, p]));

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Overview</div>
        <div class="sw-page-subtitle">A quick look at the state of your inventory.</div>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <a href="#/products" class="btn btn-outline-secondary"><i class="bi bi-plus-lg me-1"></i>New product</a>
        <a href="#/movements" class="btn sw-btn-accent"><i class="bi bi-arrow-left-right me-1"></i>Log movement</a>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${products.length}</div>
            <div class="sw-kpi-label">Active products</div>
          </div>
          <div class="sw-kpi-icon" style="background:var(--sw-accent-soft); color:var(--sw-accent-dark);"><i class="bi bi-box-seam-fill"></i></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${formatCurrency(totalValue)}</div>
            <div class="sw-kpi-label">Total stock value</div>
          </div>
          <div class="sw-kpi-icon" style="background:#EAF0FB; color:#2C4A8C;"><i class="bi bi-cash-stack"></i></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${redCount}</div>
            <div class="sw-kpi-label">Critical alerts (buy now)</div>
          </div>
          <div class="sw-kpi-icon" style="background:var(--sw-danger-soft); color:var(--sw-danger);"><i class="bi bi-exclamation-triangle-fill"></i></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${pendingPurchases}</div>
            <div class="sw-kpi-label">Pending purchase orders</div>
          </div>
          <div class="sw-kpi-icon" style="background:var(--sw-warning-soft); color:var(--sw-warning);"><i class="bi bi-cart-check-fill"></i></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="sw-card p-3 p-lg-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold mb-0"><i class="bi bi-stoplights-fill me-1" style="color:var(--sw-danger);"></i>Products needing attention</h6>
            <a href="#/semaphore" class="small sw-link">View full semaphore</a>
          </div>
          ${urgentProducts.length === 0 ? `
            <div class="sw-empty-state py-4">
              <i class="bi bi-emoji-smile"></i>
              <div>All products are at healthy levels.</div>
            </div>` : `
          <div class="table-responsive">
            <table class="table sw-table align-middle mb-0">
              <thead><tr><th>Product</th><th>Class</th><th>Stock</th><th>ROP</th><th>Status</th></tr></thead>
              <tbody>
                ${urgentProducts.map((p) => `
                  <tr class="${p.status === 'red' ? 'sw-row-urgent' : ''}">
                    <td>
                      <div class="fw-semibold">${escapeHtml(p.name)}</div>
                      <div class="small text-secondary">${escapeHtml(p.sku)}</div>
                    </td>
                    <td>${renderAbcBadge(p.abcClass)}</td>
                    <td>${p.currentStock}</td>
                    <td>${p.rop}</td>
                    <td>${renderSemaphoreBadge(p.status, SEMAPHORE_LABEL[p.status])}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>

      <div class="col-lg-5">
        <div class="sw-card p-3 p-lg-4 h-100">
          <h6 class="fw-bold mb-3"><i class="bi bi-clock-history me-1" style="color:var(--sw-accent);"></i>Recent activity</h6>
          ${recentMovements.length === 0 ? `
            <div class="sw-empty-state py-4">
              <i class="bi bi-inboxes"></i>
              <div>No movements logged yet.</div>
            </div>` : `
          <ul class="list-unstyled mb-0">
            ${recentMovements.map((m) => {
              const product = productMap.get(m.productId);
              const isEntry = m.type === 'in';
              return `
              <li class="d-flex align-items-start gap-3 py-2 border-bottom">
                <div class="sw-kpi-icon" style="width:36px;height:36px;font-size:1rem;background:${isEntry ? 'var(--sw-success-soft)' : 'var(--sw-danger-soft)'}; color:${isEntry ? 'var(--sw-success)' : 'var(--sw-danger)'};">
                  <i class="bi ${isEntry ? 'bi-box-arrow-in-down' : 'bi-box-arrow-up'}"></i>
                </div>
                <div class="flex-fill">
                  <div class="small fw-semibold">${escapeHtml(product?.name || 'Deleted product')}</div>
                  <div class="small text-secondary">${isEntry ? 'Entry' : 'Exit'} of ${m.quantity} un. · ${formatDateTime(m.date)}</div>
                </div>
              </li>`;
            }).join('')}
          </ul>`}
        </div>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3">Quick actions</h6>
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <a href="#/products" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-box-seam-fill d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Manage products
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#/movements" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-arrow-left-right d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Log movement
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#/purchases" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-cart-plus-fill d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Create purchase order
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#/reports" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-bar-chart-line-fill d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                View reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-3 small text-secondary">${yellowCount} product(s) in yellow watch level.</div>
  `;
}
