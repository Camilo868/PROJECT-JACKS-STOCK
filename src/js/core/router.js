/**
 * router.js
 * Router SPA basado en hash (#/ruta). Soporta rutas privadas,
 * parámetros dinámicos (:id) y página 404.
 */

import { isAuthenticated } from './session.js';

/** @type {Array<{ path: string, segments: string[], handler: Function, private: boolean }>} */
const routes = [];
let notFoundHandler = null;
const APP_ROOT_ID = 'app';

/**
 * Registra una ruta.
 * @param {string} path - Ej: '/', '/productos', '/productos/:id'
 * @param {Function} handler - Recibe (container, params)
 * @param {{ private?: boolean }} options
 */
export function addRoute(path, handler, options = {}) {
  routes.push({
    path,
    segments: path.split('/').filter(Boolean),
    handler,
    private: Boolean(options.private),
  });
}

/** Registra el handler para rutas no encontradas (404). */
export function setNotFound(handler) {
  notFoundHandler = handler;
}

function matchRoute(hashPath) {
  const currentSegments = hashPath.split('/').filter(Boolean);

  for (const route of routes) {
    if (route.segments.length !== currentSegments.length) continue;

    const params = {};
    let matched = true;

    for (let i = 0; i < route.segments.length; i++) {
      const routeSeg = route.segments[i];
      const currentSeg = currentSegments[i];

      if (routeSeg.startsWith(':')) {
        params[routeSeg.slice(1)] = decodeURIComponent(currentSeg);
      } else if (routeSeg !== currentSeg) {
        matched = false;
        break;
      }
    }

    if (matched) return { route, params };
  }

  return null;
}

function getContainer() {
  return document.getElementById(APP_ROOT_ID);
}

/** Navega programáticamente a una ruta. */
export function navigateTo(path) {
  window.location.hash = path.startsWith('#') ? path.slice(1) : path;
}

async function resolveRoute() {
  const container = getContainer();
  if (!container) return;

  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [hashPath] = hash.split('?');
  const match = matchRoute(hashPath || '/');

  if (!match) {
    if (notFoundHandler) {
      container.innerHTML = '';
      await notFoundHandler(container);
    }
    return;
  }

  const { route, params } = match;

  if (route.private && !isAuthenticated()) {
    navigateTo('/login');
    return;
  }

  container.innerHTML = '';
  await route.handler(container, params);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/** Inicializa el router y escucha cambios de hash. */
export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  window.addEventListener('DOMContentLoaded', resolveRoute);
  if (document.readyState !== 'loading') {
    resolveRoute();
  }
}
