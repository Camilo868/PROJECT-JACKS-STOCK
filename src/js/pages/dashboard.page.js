/**
 * dashboard.page.js
 * Panel principal: KPIs, semáforo resumido, acciones rápidas y
 * actividad reciente.
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
    // El lead time vive en el producto (lead_time_days), no en el proveedor.
    const rop = calculateROP(p, p.leadTimeDays || 0);
    const status = getSemaphoreStatus(p, rop);
    const abc = abcMap.get(p.id);
    return { ...p, rop, status, abcClass: abc?.class || 'C' };
  });

  const totalValue = products.reduce((sum, p) => sum + p.unitCost * p.currentStock, 0);
  const redCount = enriched.filter((p) => p.status === 'red').length;
  const yellowCount = enriched.filter((p) => p.status === 'yellow').length;
  const pendingPurchases = purchases.filter((p) => p.status === 'pendiente').length;

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
        <div class="sw-page-title">Resumen general</div>
        <div class="sw-page-subtitle">Visión rápida del estado de tu inventario.</div>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <a href="#/productos" class="btn btn-outline-secondary"><i class="bi bi-plus-lg me-1"></i>Nuevo producto</a>
        <a href="#/movimientos" class="btn sw-btn-accent"><i class="bi bi-arrow-left-right me-1"></i>Registrar movimiento</a>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${products.length}</div>
            <div class="sw-kpi-label">Productos activos</div>
          </div>
          <div class="sw-kpi-icon" style="background:var(--sw-accent-soft); color:var(--sw-accent-dark);"><i class="bi bi-box-seam-fill"></i></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${formatCurrency(totalValue)}</div>
            <div class="sw-kpi-label">Valor total en stock</div>
          </div>
          <div class="sw-kpi-icon" style="background:#EAF0FB; color:#2C4A8C;"><i class="bi bi-cash-stack"></i></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${redCount}</div>
            <div class="sw-kpi-label">Alertas críticas (comprar ya)</div>
          </div>
          <div class="sw-kpi-icon" style="background:var(--sw-danger-soft); color:var(--sw-danger);"><i class="bi bi-exclamation-triangle-fill"></i></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="sw-kpi">
          <div>
            <div class="sw-kpi-value">${pendingPurchases}</div>
            <div class="sw-kpi-label">Órdenes de compra pendientes</div>
          </div>
          <div class="sw-kpi-icon" style="background:var(--sw-warning-soft); color:var(--sw-warning);"><i class="bi bi-cart-check-fill"></i></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="sw-card p-3 p-lg-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold mb-0"><i class="bi bi-stoplights-fill me-1" style="color:var(--sw-danger);"></i>Productos que requieren atención</h6>
            <a href="#/semaforo" class="small sw-link">Ver semáforo completo</a>
          </div>
          ${urgentProducts.length === 0 ? `
            <div class="sw-empty-state py-4">
              <i class="bi bi-emoji-smile"></i>
              <div>Todos los productos están en niveles saludables.</div>
            </div>` : `
          <div class="table-responsive">
            <table class="table sw-table align-middle mb-0">
              <thead><tr><th>Producto</th><th>Clase</th><th>Stock</th><th>ROP</th><th>Estado</th></tr></thead>
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
          <h6 class="fw-bold mb-3"><i class="bi bi-clock-history me-1" style="color:var(--sw-accent);"></i>Actividad reciente</h6>
          ${recentMovements.length === 0 ? `
            <div class="sw-empty-state py-4">
              <i class="bi bi-inboxes"></i>
              <div>Aún no hay movimientos registrados.</div>
            </div>` : `
          <ul class="list-unstyled mb-0">
            ${recentMovements.map((m) => {
              const product = productMap.get(m.productId);
              const isEntry = m.type === 'entrada';
              return `
              <li class="d-flex align-items-start gap-3 py-2 border-bottom">
                <div class="sw-kpi-icon" style="width:36px;height:36px;font-size:1rem;background:${isEntry ? 'var(--sw-success-soft)' : 'var(--sw-danger-soft)'}; color:${isEntry ? 'var(--sw-success)' : 'var(--sw-danger)'};">
                  <i class="bi ${isEntry ? 'bi-box-arrow-in-down' : 'bi-box-arrow-up'}"></i>
                </div>
                <div class="flex-fill">
                  <div class="small fw-semibold">${escapeHtml(product?.name || 'Producto eliminado')}</div>
                  <div class="small text-secondary">${isEntry ? 'Entrada' : 'Salida'} de ${m.quantity} un. · ${formatDateTime(m.date)}</div>
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
          <h6 class="fw-bold mb-3">Acciones rápidas</h6>
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <a href="#/productos" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-box-seam-fill d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Gestionar productos
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#/movimientos" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-arrow-left-right d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Registrar movimiento
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#/compras" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-cart-plus-fill d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Crear orden de compra
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#/reportes" class="btn btn-light w-100 py-3 text-start">
                <i class="bi bi-bar-chart-line-fill d-block fs-4 mb-1" style="color:var(--sw-accent);"></i>
                Ver reportes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-3 small text-secondary">${yellowCount} producto(s) en nivel de vigilancia amarilla.</div>
  `;
}
