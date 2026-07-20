/**
 * layout.js
 * Layout reutilizable para las páginas privadas del panel administrativo:
 * monta sidebar + navbar + contenedor de contenido.
 */
import { renderSidebar } from './sidebar.js';
import { renderNavbar } from './navbar.js';
import { logout } from '../services/auth.service.js';
import { navigateTo } from '../core/router.js';

/**
 * Renderiza el shell de la aplicación dentro de `container` y devuelve
 * el nodo donde la página debe insertar su contenido.
 * @param {HTMLElement} container
 * @param {{ title: string, activePath: string }} options
 * @returns {HTMLElement} contentEl
 */
export function renderLayout(container, { title, activePath }) {
  container.innerHTML = `
    <div class="sw-shell">
      ${renderSidebar(activePath)}
      <div class="sw-main">
        ${renderNavbar(title)}
        <main class="sw-content" id="sw-content"></main>
      </div>
    </div>
    <div class="sw-sidebar-backdrop"></div>`;

  const sidebar = container.querySelector('#sw-sidebar');
  const toggleBtn = container.querySelector('#sw-sidebar-toggle');
  toggleBtn?.addEventListener('click', () => sidebar.classList.toggle('show'));

  container.querySelector('#sw-logout-btn')?.addEventListener('click', () => {
    logout();
    navigateTo('/login');
  });

  return container.querySelector('#sw-content');
}
