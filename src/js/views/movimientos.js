// ============================================================
// VISTA: MOVIMIENTOS (bitácora de entradas, salidas y ajustes)
//
// IMPORTANTE PARA EL BACKEND (lee esto antes de conectar api.js):
// Esta vista espera que cada "movimiento" venga con esta forma:
// {
//   id: "MV-0918",          // id interno del movimiento
//   ref: "OC-4482",         // referencia (orden de compra, pedido, ajuste)
//   tipo: "entrada" | "salida" | "ajuste",
//   producto: "Tornillo hexagonal M8 x 40mm",
//   sku: "TRN-M8-040",
//   ubicacion: "A-12-03",   // bodega/estante de origen o destino
//   usuario: "M. Ríos",     // quién hizo el movimiento
//   cantidad: 500,          // usar NEGATIVO para salidas, POSITIVO para entradas/ajustes+
//   fecha: "2026-07-15T09:12:00"  // ISO 8601, así el front decide cómo formatearlo
// }
// Esto es clave para el semáforo/EOQ: cada movimiento debería
// también disparar un recálculo del stock actual del producto,
// pero esa lógica vive en el backend, no aquí.
// ============================================================

import { ICONS } from '../icons.js';

// Datos de ejemplo — reemplazar por la respuesta real de
// api.js (ej. getMovimientos()) cuando el backend esté listo.
const MOVIMIENTOS_DEMO = [
  { id: "MV-0918", ref: "OC-4482", tipo: "entrada", producto: "Tornillo hexagonal M8 x 40mm", sku: "TRN-M8-040", ubicacion: "A-12-03", usuario: "M. Ríos", cantidad: 500, fecha: "Hoy · 09:12" },
  { id: "MV-0917", ref: "PED-8821", tipo: "salida", producto: "Motor eléctrico 1.5HP 220V", sku: "MTR-15H-220", ubicacion: "D-02-07", usuario: "J. Peña", cantidad: -2, fecha: "Hoy · 08:55" },
  { id: "MV-0916", ref: "OC-4479", tipo: "entrada", producto: "Palet madera EUR 1200x800", sku: "PLT-EUR-1208", ubicacion: "B-11-00", usuario: "M. Ríos", cantidad: 60, fecha: "Hoy · 08:04" },
  { id: "MV-0915", ref: "AJ-0071", tipo: "ajuste", producto: "Rodamiento SKF 6205-2RS", sku: "RDM-6205-RS", ubicacion: "C-08-04", usuario: "L. Ortega", cantidad: 3, fecha: "Ayer · 17:41" },
  { id: "MV-0914", ref: "PED-8820", tipo: "salida", producto: "Cinta embalaje transparente 48mm", sku: "CTA-EMB-048", ubicacion: "B-05-02", usuario: "S. Vega", cantidad: -24, fecha: "Ayer · 16:22" },
];

// Traducción tipo -> icono / color de fondo / color de texto / etiqueta.
// Si el backend usa otros nombres de tipo, ajusta las keys aquí.
const TIPO_CONFIG = {
  entrada: { label: "Entrada", icon: ICONS.arrowDownLeft, badge: "bg-green-50 text-green-600", iconBg: "bg-green-50 text-green-600" },
  salida:  { label: "Salida",  icon: ICONS.arrowUpRight,  badge: "bg-red-50 text-red-600",     iconBg: "bg-red-50 text-red-600" },
  ajuste:  { label: "Ajuste",  icon: ICONS.refresh,       badge: "bg-amber-50 text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
};

// Convierte una cantidad en el texto con signo y color (+500 verde, -2 rojo).
function formatoCantidad(cantidad) {
  const signo = cantidad > 0 ? '+' : '';
  const color = cantidad > 0 ? 'text-green-600' : cantidad < 0 ? 'text-red-500' : 'text-slate-600';
  return `<span class="font-mono font-semibold ${color}">${signo}${cantidad}</span>`;
}

// Genera el HTML de UNA fila del listado (no es <tr>, es un div,
// porque el diseño es de lista, no de tabla).
function filaMovimiento(m) {
  const cfg = TIPO_CONFIG[m.tipo];
  return `
    <div class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
      <div class="w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0">
        ${cfg.icon}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}">
            <span class="w-1.5 h-1.5 rounded-full bg-current"></span>${cfg.label}
          </span>
          <span class="text-xs text-slate-400 font-mono">${m.id} · Ref ${m.ref}</span>
        </div>
        <p class="font-medium text-slate-800 truncate">${m.producto}</p>
        <p class="text-xs text-slate-400 font-mono">${m.sku} · ${m.tipo === 'salida' ? 'desde' : 'hacia'} ${m.ubicacion} · ${m.usuario}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-lg">${formatoCantidad(m.cantidad)}</p>
        <p class="text-xs text-slate-400">${m.fecha}</p>
      </div>
    </div>
  `;
}

// KPI simple: cuenta/suma según tipo. Cuando conectes el backend,
// probablemente estos 4 números vengan ya calculados del endpoint
// (ej. GET /movimientos/resumen) en vez de calcularse aquí en el front.
function calcularKpis(movs) {
  const entradas = movs.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.cantidad, 0);
  const salidas = Math.abs(movs.filter(m => m.tipo === 'salida').reduce((s, m) => s + m.cantidad, 0));
  const ajustes = movs.filter(m => m.tipo === 'ajuste').length;
  const balance = movs.reduce((s, m) => s + m.cantidad, 0);
  return { entradas, salidas, ajustes, balance };
}

export function renderMovimientos() {
  const kpi = calcularKpis(MOVIMIENTOS_DEMO);

  return `
    <p class="text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-1">Bitácora</p>
    <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Movimientos</h1>
        <p class="text-sm text-slate-400 mt-1">Entradas, salidas y ajustes registrados en el almacén.</p>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-rango-fecha" class="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 inline-flex items-center gap-2">
          ${ICONS.calendar} Últimos 7 días
        </button>
        <!-- este botón lo debe enganchar el compañero de lógica a un
             formulario/modal que haga POST a /movimientos -->
        <button id="btn-nuevo-movimiento" class="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2">
          ${ICONS.plus} Nuevo movimiento
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <section class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Entradas hoy</p>
        <p class="text-2xl font-bold font-mono text-slate-900 mt-1">${kpi.entradas}</p>
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Salidas hoy</p>
        <p class="text-2xl font-bold font-mono text-slate-900 mt-1">${kpi.salidas}</p>
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Ajustes hoy</p>
        <p class="text-2xl font-bold font-mono text-slate-900 mt-1">${kpi.ajustes}</p>
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Balance neto</p>
        <p class="text-2xl font-bold font-mono ${kpi.balance < 0 ? 'text-red-500' : 'text-slate-900'} mt-1">${kpi.balance} <span class="text-xs font-normal text-slate-400">unidades</span></p>
      </div>
    </section>

    <!-- Lista de movimientos -->
    <div class="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
        <!-- Tabs solo visuales por ahora: falta lógica de filtro real (data-filtro) -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button data-filtro="todos" class="tab-filtro px-3 py-1.5 rounded-md bg-white shadow-sm text-slate-900">Todos</button>
          <button data-filtro="entrada" class="tab-filtro px-3 py-1.5 rounded-md text-slate-500">Entradas</button>
          <button data-filtro="salida" class="tab-filtro px-3 py-1.5 rounded-md text-slate-500">Salidas</button>
          <button data-filtro="ajuste" class="tab-filtro px-3 py-1.5 rounded-md text-slate-500">Ajustes</button>
        </div>
        <button id="btn-filtrar" class="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 inline-flex items-center gap-2 hover:bg-slate-50">
          ${ICONS.filter} Filtrar
        </button>
      </div>
      <!-- id="lista-movimientos": aquí el compañero de lógica reemplaza
           las filas de ejemplo cuando conecte api.js -->
      <div id="lista-movimientos" class="divide-y divide-slate-100">
        ${MOVIMIENTOS_DEMO.map(filaMovimiento).join('')}
      </div>
    </div>
  `;
}