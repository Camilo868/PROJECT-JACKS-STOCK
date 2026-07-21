/**
 * navbar.js
 * Top bar: sidebar toggle (mobile), quick search and user menu.
 */
import { getCurrentUser } from '../core/session.js';

export function renderNavbar(pageTitle) {
  const user = getCurrentUser();
  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return `
    <header class="sw-topbar">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-light sw-sidebar-toggle" id="sw-sidebar-toggle" aria-label="Open menu">
          <i class="bi bi-list fs-5"></i>
        </button>
        <div>
          <div class="fw-bold">${pageTitle}</div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <div class="dropdown">
          <button class="btn d-flex align-items-center gap-2 border-0" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="sw-avatar">${initials}</span>
            <span class="d-none d-md-inline fw-semibold">${user?.name || 'User'}</span>
            <i class="bi bi-chevron-down small text-secondary"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li><span class="dropdown-item-text small text-secondary">${user?.email || ''}</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#/settings"><i class="bi bi-gear me-2"></i>Settings</a></li>
            <li><button class="dropdown-item text-danger" id="sw-logout-btn"><i class="bi bi-box-arrow-right me-2"></i>Log out</button></li>
          </ul>
        </div>
      </div>
    </header>`;
}
