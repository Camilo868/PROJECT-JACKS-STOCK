// ============================================================
// VISTA: DASHBOARD (panel de control / vista general)
// Migrado de Tailwind a Bootstrap — solo cambian las clases CSS,
// la lógica y los datos de ejemplo siguen igual que antes.
//
// IMPORTANTE PARA EL BACKEND (esto no cambió, sigue igual):
// - Las 4 tarjetas KPI tienen números y porcentajes escritos a mano.
// - Los mini-gráficos (<polyline points="...">) son coordenadas FIJAS
//   de ejemplo, no vienen de datos reales todavía.
// - La dona "Distribución por categoría" usa un conic-gradient de
//   CSS con "65%" escrito directo, también de ejemplo.
// - id="tabla-dashboard-productos": es un RESUMEN corto (2 filas),
//   NO es la misma tabla completa de Productos (esa vive en
//   productos.js con id="tabla-productos"). Son tablas distintas
//   a propósito, no las confundas al conectar el backend.
// ============================================================

import { ICONS } from '../icons.js';
// Datos de ejemplo para la distribución por categoría. Cuando exista
// backend, esto vendría de un endpoint que agrupe el stock por
// categoría, ej. GET /dashboard/categorias. Suman 12,847 a propósito,
// para que cuadre con el KPI "Total SKUs" de arriba.
const CATEGORIAS_DEMO = [
  { nombre: "Ferretería", cantidad: 4380, color: "#0f172a" },
  { nombre: "Embalaje", cantidad: 2830, color: "#334155" },
  { nombre: "Repuestos", cantidad: 2310, color: "#64748b" },
  { nombre: "Motores", cantidad: 1790, color: "#94a3b8" },
  { nombre: "Consumibles", cantidad: 1537, color: "#cbd5e1" },
];

// Recorre las categorías con un "for" y arma el string del
// conic-gradient: cada categoría ocupa el % que le corresponde.
function construirDona(categorias) {
  const total = categorias.reduce((suma, c) => suma + c.cantidad, 0);
  let acumulado = 0;
  const partes = [];
  for (let i = 0; i < categorias.length; i++) {
    const c = categorias[i];
    const inicio = acumulado;
    acumulado += (c.cantidad / total) * 100;
    partes.push(`${c.color} ${inicio}% ${acumulado}%`);
  }
  return `conic-gradient(${partes.join(', ')})`;
}

// Recorre las categorías con un "for" y arma el HTML de la lista
// (leyenda) que va debajo de la dona: punto de color, nombre,
// cantidad y porcentaje.
function listaCategorias(categorias) {
  const total = categorias.reduce((suma, c) => suma + c.cantidad, 0);
  let html = '';
  for (let i = 0; i < categorias.length; i++) {
    const c = categorias[i];
    const porcentaje = Math.round((c.cantidad / total) * 100);
    html += `
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="d-flex align-items-center gap-2">
          <span class="rounded-circle d-inline-block" style="width:8px;height:8px;background:${c.color};"></span>
          <span style="font-size:13px;">${c.nombre}</span>
        </span>
        <span class="text-secondary" style="font-size:13px;">
          <span class="fw-semibold text-dark">${c.cantidad.toLocaleString('es')}</span> ${porcentaje}%
        </span>
      </div>
    `;
  }
  return html;
}
export function renderDashboard() {
  return `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="fs-3 fw-bold mb-0">Panel de control</h1>
        <p class="text-secondary mb-0 mt-1">Vista general del inventario · Jueves, 09 julio 2026</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <!-- Sin lógica todavía, solo diseño -->
        <button id="btn-exportar" class="btn btn-outline-secondary rounded-3">
          Exportar
        </button>
        <button id="btn-nuevo-movimiento-dashboard" class="btn btn-dark rounded-3">
          + Nuevo movimiento
        </button>
      </div>
    </div>

    <!-- TARJETAS KPI: los 4 números y el "▲ 3.2%" son de ejemplo -->
    <div class="row g-3 mb-4">

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="bg-white rounded-3 p-3 border shadow-sm h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary" style="width:36px; height:36px;">${ICONS.boxes}</div>
            <span class="badge bg-success-subtle text-success rounded-pill">▲ 3.2%</span>
          </div>
          <p class="text-secondary mb-0" style="font-size: 12px;">Total SKUs</p>
          <p class="fs-4 fw-bold mb-0 mt-1">12,847</p>
          <!-- mini-gráfico de ejemplo, ver nota arriba sobre "points" -->
          <svg class="w-100 mt-2" style="height: 32px;" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline points="0,25 20,20 40,22 60,10 80,14 100,5" fill="none" stroke="#0F172A" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="bg-white rounded-3 p-3 border shadow-sm h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary" style="width:36px; height:36px;">${ICONS.dollar}</div>
            <span class="badge bg-success-subtle text-success rounded-pill">▲ 8.1%</span>
          </div>
          <p class="text-secondary mb-0" style="font-size: 12px;">Valor de inventario</p>
          <p class="fs-4 fw-bold mb-0 mt-1">$1.284.902</p>
          <svg class="w-100 mt-2" style="height: 32px;" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline points="0,20 20,18 40,15 60,17 80,8 100,6" fill="none" stroke="#0F172A" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="bg-white rounded-3 p-3 border shadow-sm h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="rounded-circle bg-warning-subtle d-flex align-items-center justify-content-center text-warning" style="width:36px; height:36px;">${ICONS.warning}</div>
            <span class="badge bg-warning-subtle text-warning rounded-pill">▼ 12</span>
          </div>
          <p class="text-secondary mb-0" style="font-size: 12px;">Bajo stock</p>
          <p class="fs-4 fw-bold mb-0 mt-1">38</p>
          <svg class="w-100 mt-2" style="height: 32px;" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline points="0,10 20,12 40,8 60,15 80,18 100,20" fill="none" stroke="#F59E0B" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="bg-white rounded-3 p-3 border shadow-sm h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary" style="width:36px; height:36px;">${ICONS.swap}</div>
            <span class="badge bg-light text-secondary rounded-pill">▼ 2.4%</span>
          </div>
          <p class="text-secondary mb-0" style="font-size: 12px;">Movimientos hoy</p>
          <p class="fs-4 fw-bold mb-0 mt-1">1,204</p>
          <svg class="w-100 mt-2" style="height: 32px;" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline points="0,15 20,5 40,18 60,8 80,20 100,10" fill="none" stroke="#0F172A" stroke-width="2"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="row g-3">

      <section class="col-12 col-xl-8">
        <div class="bg-white rounded-3 border shadow-sm h-100">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 px-4 py-3 border-bottom">
            <div>
              <h2 class="fs-6 fw-semibold mb-0">Productos en almacén</h2>
              <p class="text-secondary mb-0 mt-1" style="font-size: 12px;">Actualizado hace 2 minutos · 12,847 SKUs totales</p>
            </div>
            <!-- Tabs solo visuales, sin data-filtro ni lógica de clic todavía
                 (a diferencia de movimientos.js que sí tiene data-filtro) -->
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-dark">Todos</button>
              <button class="btn btn-outline-secondary">Óptimo</button>
              <button class="btn btn-outline-secondary">Bajo</button>
              <button class="btn btn-outline-secondary">Crítico</button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr class="text-secondary text-uppercase" style="font-size: 11px;">
                  <th class="px-4 fw-medium">Producto</th>
                  <th class="fw-medium">SKU</th>
                  <th class="fw-medium">Categoría</th>
                  <th class="fw-medium">Stock</th>
                  <th class="fw-medium">Mínimo</th>
                  <th class="fw-medium">Estado</th>
                </tr>
              </thead>
              <!-- Este es un RESUMEN corto (solo 2 filas de ejemplo), no la
                   tabla completa de Productos. Id distinto a propósito. -->
              <tbody id="tabla-dashboard-productos">
                <tr>
                  <td class="px-4 fw-medium">Tornillo hexagonal M8 x 40mm</td>
                  <td class="text-secondary">TRN-M8-040</td>
                  <td class="text-secondary">Ferretería</td>
                  <td>
                    <div class="progress mb-1" style="width: 96px; height: 6px;">
                      <div class="progress-bar bg-success" style="width: 90%"></div>
                    </div>
                    <span class="text-secondary" style="font-size: 12px;">1240</span>
                  </td>
                  <td class="text-secondary">400</td>
                  <td>
                    <span class="badge bg-success-subtle text-success">
                      <span class="rounded-circle bg-success d-inline-block me-1" style="width:6px; height:6px;"></span>Óptimo
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="px-4 fw-medium">Caja de cartón 30x30</td>
                  <td class="text-secondary">CJA-3030</td>
                  <td class="text-secondary">Empaque</td>
                  <td>
                    <div class="progress mb-1" style="width: 96px; height: 6px;">
                      <div class="progress-bar bg-warning" style="width: 40%"></div>
                    </div>
                    <span class="text-secondary" style="font-size: 12px;">96</span>
                  </td>
                  <td class="text-secondary">150</td>
                  <td>
                    <span class="badge bg-warning-subtle text-warning">
                      <span class="rounded-circle bg-warning d-inline-block me-1" style="width:6px; height:6px;"></span>Bajo
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

     <section class="col-12 col-xl-4">
  <div class="bg-white rounded-3 border shadow-sm p-4 h-100">
    <h2 class="fs-6 fw-semibold mb-0">Distribución por categoría</h2>
    <p class="text-secondary mt-1 mb-4" style="font-size: 12px;">Participación sobre el total de SKUs</p>
    <div class="rounded-circle mx-auto position-relative" style="width:160px;height:160px;background:${construirDona(CATEGORIAS_DEMO)};">
      <div class="position-absolute top-50 start-50 translate-middle bg-white rounded-circle d-flex flex-column align-items-center justify-content-center" style="width:120px;height:120px;">
        <span class="text-secondary" style="font-size: 12px;">SKUs</span>
        <span class="fs-5 fw-bold">12.8k</span>
      </div>
    </div>
    <div class="mt-4">
      ${listaCategorias(CATEGORIAS_DEMO)}
    </div>
  </div>
</section>
    </div>
    
  `;
}