// ============================================================
// VISTA: REPORTES (analítica + descargas ejecutivas)
//
// IMPORTANTE PARA EL BACKEND:
// 1) El gráfico "Flujo de inventario" espera un array de 12
//    puntos con { mes, entradas, salidas }. Cuando exista el
//    endpoint real (ej. GET /reportes/flujo?rango=12m), solo
//    hay que reemplazar FLUJO_DEMO por esa respuesta.
// 2) "Top productos rotados" espera { producto, unidades, tendencia }
//    donde tendencia es "up" | "down" (sube o baja rotación).
// 3) Los botones de "Descargar XLSX/PDF" en Reportes disponibles
//    NO generan el archivo en el front — eso lo hace el backend.
//    Aquí solo se deja el id de cada botón para que el compañero
//    de lógica le enganche el fetch a su endpoint correspondiente.
// ============================================================

import { ICONS } from '../icons.js';

// --- Datos de ejemplo, reemplazar por la respuesta real de la API ---
const FLUJO_DEMO = [
  { mes: "Ene", entradas: 320, salidas: 260 },
  { mes: "Feb", entradas: 410, salidas: 400 },
  { mes: "Mar", entradas: 390, salidas: 430 },
  { mes: "Abr", entradas: 430, salidas: 405 },
  { mes: "May", entradas: 500, salidas: 520 },
  { mes: "Jun", entradas: 480, salidas: 510 },
  { mes: "Jul", entradas: 560, salidas: 500 },
  { mes: "Ago", entradas: 590, salidas: 570 },
  { mes: "Sep", entradas: 610, salidas: 615 },
  { mes: "Oct", entradas: 650, salidas: 600 },
  { mes: "Nov", entradas: 680, salidas: 630 },
  { mes: "Dic", entradas: 720, salidas: 670 },
];

const TOP_PRODUCTOS_DEMO = [
  { producto: "Tornillo hexagonal M8 x 40mm", unidades: 12480, tendencia: "up" },
  { producto: "Palet madera EUR 1200x800", unidades: 8340, tendencia: "up" },
  { producto: "Caja cartón corrugado 40x30x25", unidades: 6210, tendencia: "down" },
  { producto: "Rodamiento SKF 6205-2RS", unidades: 4820, tendencia: "up" },
  { producto: "Cinta embalaje transparente 48mm", unidades: 3910, tendencia: "down" },
];

const REPORTES_DISPONIBLES_DEMO = [
  { id: "inventario-valorizado", titulo: "Inventario valorizado", desc: "Stock actual multiplicado por costo unitario", formato: "XLSX" },
  { id: "rotacion-mensual", titulo: "Rotación mensual", desc: "Ratio de salidas sobre stock promedio", formato: "PDF" },
  { id: "productos-bajo-minimo", titulo: "Productos bajo mínimo", desc: "Listado con sugerencia de reorden", formato: "XLSX" },
  { id: "movimientos-por-usuario", titulo: "Movimientos por usuario", desc: "Actividad detallada por operario", formato: "PDF" },
];

// --- Construcción del gráfico SVG a mano (sin librerías) ---
// Recibe el array de valores de una sola serie (todas las entradas
// o todas las salidas) y devuelve el atributo "d" de un <path>.
function construirLinea(valores, ancho, alto, min, max) {
  const paso = ancho / (valores.length - 1);
  const escalar = (v) => alto - ((v - min) / (max - min)) * alto;
  return valores
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * paso} ${escalar(v)}`)
    .join(' ');
}

function graficoFlujo() {
  const ancho = 760;
  const alto = 240;
  const todos = FLUJO_DEMO.flatMap(p => [p.entradas, p.salidas]);
  const min = Math.min(...todos) * 0.9;
  const max = Math.max(...todos) * 1.05;

  const lineaEntradas = construirLinea(FLUJO_DEMO.map(p => p.entradas), ancho, alto, min, max);
  const lineaSalidas = construirLinea(FLUJO_DEMO.map(p => p.salidas), ancho, alto, min, max);

  // Puntos para dibujar los circulitos sobre cada línea
  const paso = ancho / (FLUJO_DEMO.length - 1);
  const escalar = (v) => alto - ((v - min) / (max - min)) * alto;
  const puntos = (campo, color) => FLUJO_DEMO
    .map((p, i) => `<circle cx="${i * paso}" cy="${escalar(p[campo])}" r="3.5" fill="${color}"/>`)
    .join('');

  return `
    <svg viewBox="0 0 ${ancho} ${alto}" class="w-full h-56" preserveAspectRatio="none">
      <!-- líneas guía horizontales -->
      ${[0, 0.25, 0.5, 0.75, 1].map(f => `<line x1="0" y1="${alto * f}" x2="${ancho}" y2="${alto * f}" stroke="#e2e8f0" stroke-dasharray="4 4"/>`).join('')}
      <path d="${lineaEntradas}" fill="none" stroke="#0f172a" stroke-width="2"/>
      <path d="${lineaSalidas}" fill="none" stroke="#f59e0b" stroke-width="2"/>
      ${puntos('entradas', '#0f172a')}
      ${puntos('salidas', '#f59e0b')}
    </svg>
    <div class="flex justify-between text-xs text-slate-400 mt-2 px-1">
      ${FLUJO_DEMO.map(p => `<span>${p.mes}</span>`).join('')}
    </div>
  `;
}

function filaProductoTop(p) {
  const max = TOP_PRODUCTOS_DEMO[0].unidades; // el primero define el 100% de la barra
  const ancho = Math.round((p.unidades / max) * 100);
  const flecha = p.tendencia === 'up'
    ? '<span class="text-green-600">↗</span>'
    : '<span class="text-red-500">↘</span>';
  return `
    <div class="mb-4 last:mb-0">
      <div class="flex justify-between items-center text-sm mb-1">
        <span class="text-slate-700 truncate pr-2">${p.producto}</span>
        <span class="font-mono text-slate-500 shrink-0">${flecha} ${p.unidades.toLocaleString('es-CO')}</span>
      </div>
      <div class="h-1.5 rounded-full bg-slate-100">
        <div class="h-1.5 rounded-full bg-slate-900" style="width:${ancho}%"></div>
      </div>
    </div>
  `;
}

function tarjetaReporte(r) {
  const icono = r.formato === 'XLSX' ? ICONS.barChart : ICONS.package;
  return `
    <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col">
      <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-4">${icono}</div>
      <p class="font-semibold text-slate-900">${r.titulo}</p>
      <p class="text-xs text-slate-400 mt-1 flex-1">${r.desc}</p>
      <!-- data-reporte-id: aquí el compañero de lógica engancha el
           fetch al endpoint real de descarga (ej. GET /reportes/${r.id}) -->
      <button data-reporte-id="${r.id}" class="btn-descargar-reporte mt-4 h-10 rounded-xl border border-slate-200 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-slate-50">
        ${ICONS.upload} Descargar ${r.formato}
      </button>
    </div>
  `;
}

export function renderReportes() {
  return `
    <p class="text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-1">Analítica</p>
    <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Reportes</h1>
        <p class="text-sm text-slate-400 mt-1">Visualiza tendencias y descarga reportes ejecutivos.</p>
      </div>
      <div class="flex items-center gap-2">
        <select id="select-rango" class="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm">
          <option>Últimos 12 meses</option>
          <option>Últimos 6 meses</option>
          <option>Últimos 90 días</option>
        </select>
        <!-- exporta TODOS los reportes de golpe, distinto a las tarjetas individuales de abajo -->
        <button id="btn-exportar-todo" class="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2">
          ${ICONS.upload} Exportar todo
        </button>
      </div>
    </div>

    <!-- Gráfico + Top productos -->
    <section class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
      <div class="xl:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="font-semibold text-slate-900">Flujo de inventario · 12 meses</p>
            <p class="text-xs text-slate-400">Entradas vs salidas mensuales</p>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-900"></span>Entradas</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span>Salidas</span>
          </div>
        </div>
        ${graficoFlujo()}
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p class="font-semibold text-slate-900">Top productos rotados</p>
        <p class="text-xs text-slate-400 mb-4">Últimos 90 días</p>
        ${TOP_PRODUCTOS_DEMO.map(filaProductoTop).join('')}
      </div>
    </section>

    <!-- Reportes descargables -->
    <p class="font-semibold text-slate-900 mb-3">Reportes disponibles</p>
    <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      ${REPORTES_DISPONIBLES_DEMO.map(tarjetaReporte).join('')}
    </section>
  `;
}