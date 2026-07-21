/**
 * sidebar.js
 * Sidebar de navegación principal. Marca como activo el enlace de la
 * ruta actual y expone un id de contenedor para toggle en móvil.
 */

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { path: '/productos', icon: 'bi-box-seam-fill', label: 'Productos' },
      { path: '/proveedores', icon: 'bi-truck', label: 'Proveedores' },
      { path: '/bodegas', icon: 'bi-building', label: 'Bodegas' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { path: '/movimientos', icon: 'bi-arrow-left-right', label: 'Movimientos' },
      { path: '/semaforo', icon: 'bi-stoplights-fill', label: 'Semáforo de compra' },
      { path: '/compras', icon: 'bi-cart-check-fill', label: 'Órdenes de compra' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/reportes', icon: 'bi-bar-chart-line-fill', label: 'Reportes' },
      { path: '/configuracion', icon: 'bi-gear-fill', label: 'Configuración' },
    ],
  },
];

export function renderSidebar(activePath) {
  const sections = NAV_SECTIONS.map((section) => `
    <div class="sw-nav-section-label">${section.label}</div>
    ${section.items.map((item) => `
      <a href="#${item.path}" class="sw-nav-link ${activePath.startsWith(item.path) ? 'active' : ''}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `).join('')}
  `).join('');

  return `
    <aside class="sw-sidebar" id="sw-sidebar">
      <div class="sw-sidebar-brand">
         <div class="sw-brand-mark"><img src="./src/assets/img/jack.png" alt="Jacks-Stock" style="width:52px; height:42px; object-fit:contain;"></div>
        <span>JACKS STOCKS</span>
      </div>
      <nav class="sw-sidebar-nav">${sections}</nav>
      <div class="sw-sidebar-footer">
        <div class="small text-white-50">CodeUp RIWI · Proyecto Integrador</div>
      </div>
    </aside>`;
}
