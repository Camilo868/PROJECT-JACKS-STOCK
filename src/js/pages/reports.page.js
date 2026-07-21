/**
 * reports.page.js
 * Decision-support reports: ABC distribution, semaphore breakdown and
 * recent movements. PDF/Excel export is planned for v2 (see project
 * backlog).
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import { MovementService } from '../services/movement.service.js';
import { classifyABC, calculateROP, getSemaphoreStatus } from '../utils/inventory-calc.js';
import { formatCurrency, escapeHtml } from '../utils/format.js';

export async function renderReportsPage(container) {
  const content = renderLayout(container, { title: 'Reports', activePath: '/reports' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;

  const [products, suppliers, movements] = await Promise.all([
    ProductService.getAll(), SupplierService.getAll(), MovementService.getAll(),
  ]);

  const abcMap = classifyABC(products);

  const abcCounts = { A: 0, B: 0, C: 0 };
  const abcValue = { A: 0, B: 0, C: 0 };
  let semaphoreCounts = { red: 0, yellow: 0, green: 0 };

  products.forEach((p) => {
    const entry = abcMap.get(p.id);
    abcCounts[entry.class] += 1;
    abcValue[entry.class] += entry.value;
    // Lead time lives on the product (lead_time_days), not on the supplier.
    const rop = calculateROP(p, p.leadTimeDays || 0);
    semaphoreCounts[getSemaphoreStatus(p, rop)] += 1;
  });

  const totalValue = Object.values(abcValue).reduce((a, b) => a + b, 0) || 1;

  const topProducts = [...products]
    .map((p) => ({ ...p, value: p.unitCost * p.annualDemand }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const last30 = movements.filter((m) => (Date.now() - new Date(m.date).getTime()) <= 30 * 86400000);
  const entriesQty = last30.filter((m) => m.type === 'in').reduce((s, m) => s + m.quantity, 0);
  const exitsQty = last30.filter((m) => m.type === 'out').reduce((s, m) => s + m.quantity, 0);

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Reports</div>
        <div class="sw-page-subtitle">Key indicators to prioritize purchasing and inventory decisions.</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" disabled title="Available in v2"><i class="bi bi-file-earmark-pdf me-1"></i>Export PDF</button>
        <button class="btn btn-outline-secondary" disabled title="Available in v2"><i class="bi bi-file-earmark-excel me-1"></i>Export Excel</button>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4 h-100">
          <h6 class="fw-bold mb-3">ABC distribution by consumption value</h6>
          ${['A', 'B', 'C'].map((cls) => {
            const pct = Math.round((abcValue[cls] / totalValue) * 100);
            const color = cls === 'A' ? 'var(--sw-accent)' : cls === 'B' ? '#2C4A8C' : '#8A93A3';
            return `
            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span class="fw-semibold">Class ${cls} · ${abcCounts[cls]} product(s)</span>
                <span>${pct}% of value · ${formatCurrency(abcValue[cls])}</span>
              </div>
              <div class="progress" style="height:10px;">
                <div class="progress-bar" style="width:${pct}%; background-color:${color};"></div>
              </div>
            </div>`;
          }).join('')}
          <div class="small text-secondary mt-2">Based on the Pareto rule: A = 80% of value, B = next 15%, C = remaining 5%.</div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4 h-100">
          <h6 class="fw-bold mb-3">Purchase semaphore status</h6>
          <div class="row text-center g-3">
            <div class="col-4">
              <div class="sw-kpi-value" style="color:var(--sw-danger);">${semaphoreCounts.red}</div>
              <div class="small text-secondary">Buy now</div>
            </div>
            <div class="col-4">
              <div class="sw-kpi-value" style="color:var(--sw-warning);">${semaphoreCounts.yellow}</div>
              <div class="small text-secondary">Watch</div>
            </div>
            <div class="col-4">
              <div class="sw-kpi-value" style="color:var(--sw-success);">${semaphoreCounts.green}</div>
              <div class="small text-secondary">Healthy</div>
            </div>
          </div>
          <hr>
          <h6 class="fw-bold mb-2 mt-3">Movements (last 30 days)</h6>
          <div class="d-flex justify-content-between small mb-1"><span>Units received</span><span class="fw-semibold text-success">+${entriesQty}</span></div>
          <div class="d-flex justify-content-between small"><span>Units shipped out</span><span class="fw-semibold text-danger">-${exitsQty}</span></div>
        </div>
      </div>

      <div class="col-12">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3">Top 5 products by annual consumption value</h6>
          <div class="table-responsive">
            <table class="table sw-table align-middle mb-0">
              <thead><tr><th>Product</th><th>Annual demand</th><th>Unit cost</th><th>Consumption value</th></tr></thead>
              <tbody>
                ${topProducts.map((p) => `
                  <tr>
                    <td class="fw-semibold">${escapeHtml(p.name)}</td>
                    <td>${p.annualDemand}</td>
                    <td>${formatCurrency(p.unitCost)}</td>
                    <td>${formatCurrency(p.value)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}
