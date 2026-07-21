/**
 * sidebar.js
 * Main navigation sidebar. Marks the current route's link as active
 * and exposes a container id for the mobile toggle.
 */

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { path: '/products', icon: 'bi-box-seam-fill', label: 'Products' },
      { path: '/suppliers', icon: 'bi-truck', label: 'Suppliers' },
      { path: '/warehouses', icon: 'bi-building', label: 'Warehouses' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/movements', icon: 'bi-arrow-left-right', label: 'Movements' },
      { path: '/semaphore', icon: 'bi-stoplights-fill', label: 'Purchase Semaphore' },
      { path: '/purchases', icon: 'bi-cart-check-fill', label: 'Purchase Orders' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/reports', icon: 'bi-bar-chart-line-fill', label: 'Reports' },
      { path: '/settings', icon: 'bi-gear-fill', label: 'Settings' },
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
        <div class="small text-white-50">CodeUp RIWI · Capstone Project</div>
      </div>
    </aside>`;
}
