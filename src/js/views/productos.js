// ============================================================
// VISTA: PRODUCTOS
// Migrado de Tailwind a Bootstrap — solo cambian las clases CSS,
// los datos de ejemplo y la lógica siguen exactamente igual.
// Esta vista no depende de ninguna librería externa: los iconos
// son SVG escritos a mano (icons.js), no imágenes ni librería de iconos.
// ============================================================

import { ICONS } from '../icons.js';

// Datos de ejemplo (hardcodeados) para poder maquetar sin depender
// todavía del backend. Cuando conecten api.js, esto se reemplaza
// por la respuesta real del fetch().
const PRODUCTOS_DEMO = [
  { name: "Tornillo hexagonal M8 x 40mm", sku: "TRN-M8-040", category: "Ferretería", location: "A-12-03", stock: 1240, price: 0.35, status: "ok" },
  { name: "Caja cartón corrugado 40x30x25", sku: "CJA-COR-4030", category: "Embalaje", location: "B-04-01", stock: 86, price: 2.10, status: "warn" },
  { name: "Motor eléctrico 1.5HP 220V", sku: "MTR-15H-220", category: "Motores", location: "D-02-07", stock: 12, price: 289.90, status: "low" },
  { name: "Rodamiento SKF 6205-2RS", sku: "RDM-6205-RS", category: "Repuestos", location: "C-08-04", stock: 342, price: 8.75, status: "ok" },
  { name: "Cinta embalaje transparente 48mm", sku: "CTA-EMB-048", category: "Embalaje", location: "B-05-02", stock: 58, price: 1.40, status: "warn" },
  { name: "Correa trapecial A-42", sku: "CRR-TRP-A42", category: "Repuestos", location: "C-09-01", stock: 4, price: 12.50, status: "low" },
];

// Estas 3 constantes traducen el status ("ok"/"warn"/"low") a las
// clases de badge de Bootstrap (antes eran clases de Tailwind).
const STATUS_LABEL = { ok: "Óptimo", warn: "Bajo", low: "Crítico" };
const STATUS_DOT = { ok: "bg-success", warn: "bg-warning", low: "bg-danger" };
const STATUS_BADGE = {
  ok: "bg-success-subtle text-success",
  warn: "bg-warning-subtle text-warning",
  low: "bg-danger-subtle text-danger",
};

// Esta función recibe UN producto y devuelve el HTML de UNA fila <tr>.
function filaProducto(p) {
  return `
    <tr>
      <td class="px-4"><input type="checkbox" class="form-check-input"></td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="rounded-3 bg-light d-flex align-items-center justify-content-center text-secondary" style="width:36px; height:36px;">
            ${ICONS.package}
          </div>
          <span class="fw-medium">${p.name}</span>
        </div>
      </td>
      <td>
        <span class="font-monospace bg-light rounded-2 px-2 py-1" style="font-size: 12px;">${p.sku}</span>
      </td>
      <td class="text-secondary">${p.category}</td>
      <td class="font-monospace text-secondary" style="font-size: 12px;">${p.location}</td>
      <td class="text-end font-monospace fw-semibold">${p.stock.toLocaleString('es')}</td>
      <td class="text-end font-monospace text-secondary">$${p.price.toFixed(2)}</td>
      <td class="px-4">
        <span class="badge ${STATUS_BADGE[p.status]}">
          <span class="rounded-circle ${STATUS_DOT[p.status]} d-inline-block me-1" style="width:6px; height:6px;"></span>
          ${STATUS_LABEL[p.status]}
        </span>
      </td>
    </tr>
  `;
}

export function renderProductos() {
  return `
    <!-- ENCABEZADO: título + botones de acción -->
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div>
        <p class="text-secondary text-uppercase mb-1" style="font-size: 11px; letter-spacing: 0.05em;">Catálogo</p>
        <h1 class="fs-3 fw-bold mb-0">Productos</h1>
        <p class="text-secondary mb-0 mt-1">Gestiona SKUs, categorías y ubicaciones del almacén.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <!-- Estos botones no tienen lógica todavía, solo diseño.
             Los id= son para que tu compañero de lógica los enganche después. -->
        <button id="btn-importar-csv" class="btn btn-outline-secondary rounded-3">
          ${ICONS.upload} Importar CSV
        </button>
        <button id="btn-nuevo-producto" class="btn btn-dark rounded-3">
          ${ICONS.plus} Nuevo producto
        </button>
      </div>
    </div>

    <!-- TARJETAS KPI: 4 resúmenes rápidos arriba de la tabla -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3">
        <div class="rounded-3 border bg-white p-3 shadow-sm d-flex align-items-center gap-3 h-100">
          <div class="rounded-3 bg-light text-secondary d-flex align-items-center justify-content-center" style="width:44px; height:44px;">${ICONS.boxes}</div>
          <div>
            <p class="text-secondary mb-0" style="font-size: 12px;">Total productos</p>
            <p class="fs-5 fw-bold font-monospace mb-0">12,847</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="rounded-3 border bg-white p-3 shadow-sm d-flex align-items-center gap-3 h-100">
          <div class="rounded-3 bg-light text-secondary d-flex align-items-center justify-content-center" style="width:44px; height:44px;">${ICONS.tag}</div>
          <div>
            <p class="text-secondary mb-0" style="font-size: 12px;">Categorías activas</p>
            <p class="fs-5 fw-bold font-monospace mb-0">24</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="rounded-3 border bg-white p-3 shadow-sm d-flex align-items-center gap-3 h-100">
          <div class="rounded-3 bg-light text-secondary d-flex align-items-center justify-content-center" style="width:44px; height:44px;">${ICONS.layers}</div>
          <div>
            <p class="text-secondary mb-0" style="font-size: 12px;">Ubicaciones</p>
            <p class="fs-5 fw-bold font-monospace mb-0">186</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="rounded-3 border bg-white p-3 shadow-sm d-flex align-items-center gap-3 h-100">
          <div class="rounded-3 bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style="width:44px; height:44px;">${ICONS.alert}</div>
          <div>
            <p class="text-secondary mb-0" style="font-size: 12px;">Requieren atención</p>
            <p class="fs-5 fw-bold font-monospace mb-0">38</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TARJETA PRINCIPAL: buscador + filtros + tabla + paginación -->
    <div class="rounded-3 border bg-white shadow-sm">

      <!-- Barra de buscador y filtros -->
      <div class="d-flex flex-wrap align-items-center gap-2 px-4 py-3 border-bottom">
        <div class="position-relative flex-grow-1" style="min-width: 240px;">
          <span class="position-absolute text-secondary" style="left: 14px; top: 9px;">${ICONS.search}</span>
          <input type="search" placeholder="Buscar por nombre, SKU o ubicación..." class="form-control rounded-3 ps-5">
        </div>
        <select class="form-select rounded-3 w-auto">
          <option>Todas las categorías</option>
          <option>Ferretería</option>
          <option>Embalaje</option>
          <option>Repuestos</option>
          <option>Motores</option>
        </select>
        <select class="form-select rounded-3 w-auto">
          <option>Todos los estados</option>
          <option>Óptimo</option>
          <option>Bajo</option>
          <option>Crítico</option>
        </select>
        <button class="btn btn-outline-secondary rounded-3">
          ${ICONS.filter} Más filtros
        </button>
      </div>

      <!-- Tabla de productos -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr class="text-secondary text-uppercase bg-light" style="font-size: 11px;">
              <th class="px-4"><input type="checkbox" class="form-check-input"></th>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th class="text-end">Stock</th>
              <th class="text-end">Precio</th>
              <th class="px-4">Estado</th>
            </tr>
          </thead>
          <!-- id="tabla-productos": aquí es donde tu compañero, cuando
               conecte el backend, va a reemplazar estas filas de ejemplo
               por las filas reales usando document.getElementById() -->
          <tbody id="tabla-productos">
            ${PRODUCTOS_DEMO.map(filaProducto).join('')}
          </tbody>
        </table>
      </div>

      <!-- Paginación (solo visual por ahora, sin lógica de cambio de página) -->
      <div class="d-flex align-items-center justify-content-between px-4 py-3 border-top text-secondary" style="font-size: 12px;">
        <span>Mostrando ${PRODUCTOS_DEMO.length} de 12,847 productos</span>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary">Anterior</button>
          <button class="btn btn-dark font-monospace">1</button>
          <button class="btn btn-outline-secondary font-monospace">2</button>
          <button class="btn btn-outline-secondary font-monospace">3</button>
          <button class="btn btn-outline-secondary">Siguiente</button>
        </div>
      </div>
    </div>
  `;
}