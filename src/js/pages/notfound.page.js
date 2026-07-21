/**
 * notfound.page.js — Página 404.
 */
export async function renderNotFoundPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center text-center" style="min-height:100vh; padding: 2rem;">
      <div class="sw-brand mb-4">
        <div class="sw-brand-mark"><i class="bi bi-boxes"></i></div>
        JACKS STOCKS
      </div>
      <div class="display-3 fw-bold" style="color: var(--sw-accent);">404</div>
      <h4 class="fw-bold mb-2">Página no encontrada</h4>
      <p class="text-secondary mb-4" style="max-width:420px;">
        La ruta que buscas no existe o fue movida. Verifica la URL o vuelve al panel principal.
      </p>
      <a href="#/dashboard" class="btn sw-btn-accent px-4">Volver al Dashboard</a>
    </div>`;
}
