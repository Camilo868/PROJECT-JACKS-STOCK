/**
 * reports.page.js
 * Reportes de apoyo a la toma de decisiones: distribución ABC, semáforo
 * y movimientos recientes. La exportación a PDF/Excel queda planificada
 * para la versión 2 del producto (ver backlog del proyecto).
 */
import { renderLayout } from '../components/layout.js';
import { ProductService } from '../services/product.service.js';
import { SupplierService } from '../services/supplier.service.js';
import { MovementService } from '../services/movement.service.js';
import { classifyABC, calculateROP, getSemaphoreStatus } from '../utils/inventory-calc.js';
import { formatCurrency, escapeHtml } from '../utils/format.js';

export async function renderReportsPage(container) {
  const content = renderLayout(container, { title: 'Reportes', activePath: '/reportes' });
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
    // El lead time vive en el producto (lead_time_days), no en el proveedor.
    const rop = calculateROP(p, p.leadTimeDays || 0);
    semaphoreCounts[getSemaphoreStatus(p, rop)] += 1;
  });

  const totalValue = Object.values(abcValue).reduce((a, b) => a + b, 0) || 1;

  const topProducts = [...products]
    .map((p) => ({ ...p, value: p.unitCost * p.annualDemand }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const last30 = movements.filter((m) => (Date.now() - new Date(m.date).getTime()) <= 30 * 86400000);
  const entriesQty = last30.filter((m) => m.type === 'entrada').reduce((s, m) => s + m.quantity, 0);
  const exitsQty = last30.filter((m) => m.type === 'salida').reduce((s, m) => s + m.quantity, 0);

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Reportes</div>
        <div class="sw-page-subtitle">Indicadores clave para priorizar decisiones de compra e inventario.</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" disabled title="Disponible en la versión 2"><i class="bi bi-file-earmark-pdf me-1"></i>Exportar PDF</button>
        <button class="btn btn-outline-secondary" disabled title="Disponible en la versión 2"><i class="bi bi-file-earmark-excel me-1"></i>Exportar Excel</button>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4 h-100">
          <h6 class="fw-bold mb-3">Distribución ABC por valor de consumo</h6>
          ${['A', 'B', 'C'].map((cls) => {
            const pct = Math.round((abcValue[cls] / totalValue) * 100);
            const color = cls === 'A' ? 'var(--sw-accent)' : cls === 'B' ? '#2C4A8C' : '#8A93A3';
            return `
            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span class="fw-semibold">Clase ${cls} · ${abcCounts[cls]} producto(s)</span>
                <span>${pct}% del valor · ${formatCurrency(abcValue[cls])}</span>
              </div>
              <div class="progress" style="height:10px;">
                <div class="progress-bar" style="width:${pct}%; background-color:${color};"></div>
              </div>
            </div>`;
          }).join('')}
          <div class="small text-secondary mt-2">Basado en la regla de Pareto: A = 80% del valor, B = siguiente 15%, C = 5% restante.</div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4 h-100">
          <h6 class="fw-bold mb-3">Estado del semáforo de compra</h6>
          <div class="row text-center g-3">
            <div class="col-4">
              <div class="sw-kpi-value" style="color:var(--sw-danger);">${semaphoreCounts.red}</div>
              <div class="small text-secondary">Comprar ahora</div>
            </div>
            <div class="col-4">
              <div class="sw-kpi-value" style="color:var(--sw-warning);">${semaphoreCounts.yellow}</div>
              <div class="small text-secondary">Vigilar</div>
            </div>
            <div class="col-4">
              <div class="sw-kpi-value" style="color:var(--sw-success);">${semaphoreCounts.green}</div>
              <div class="small text-secondary">Saludable</div>
            </div>
          </div>
          <hr>
          <h6 class="fw-bold mb-2 mt-3">Movimientos (últimos 30 días)</h6>
          <div class="d-flex justify-content-between small mb-1"><span>Unidades ingresadas</span><span class="fw-semibold text-success">+${entriesQty}</span></div>
          <div class="d-flex justify-content-between small"><span>Unidades despachadas</span><span class="fw-semibold text-danger">-${exitsQty}</span></div>
        </div>
      </div>

      <div class="col-12">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3">Top 5 productos por valor de consumo anual</h6>
          <div class="table-responsive">
            <table class="table sw-table align-middle mb-0">
              <thead><tr><th>Producto</th><th>Demanda anual</th><th>Costo unit.</th><th>Valor de consumo</th></tr></thead>
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
