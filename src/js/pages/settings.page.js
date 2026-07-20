/**
 * settings.page.js
 * Perfil del usuario y parámetros generales del sistema.
 */
import { renderLayout } from '../components/layout.js';
import { getCurrentUser, setSession, getSession } from '../core/session.js';
import { SettingsService } from '../services/settings.service.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { escapeHtml } from '../utils/format.js';

export async function renderSettingsPage(container) {
  const content = renderLayout(container, { title: 'Configuración', activePath: '/configuracion' });
  const user = getCurrentUser();
  const settings = SettingsService.get();

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Configuración</div>
        <div class="sw-page-subtitle">Datos de tu cuenta y parámetros generales del sistema.</div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-person-circle me-1"></i>Perfil</h6>
          <form id="profile-form" novalidate>
            <div class="mb-3">
              <label class="form-label">Nombre completo</label>
              <input type="text" class="form-control" name="name" value="${escapeHtml(user?.name || '')}" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
              <label class="form-label">Correo electrónico</label>
              <input type="email" class="form-control" name="email" value="${escapeHtml(user?.email || '')}" disabled>
              <div class="form-text">El correo no se puede modificar en esta versión.</div>
            </div>
            <button type="submit" class="btn sw-btn-accent">Guardar cambios</button>
          </form>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-sliders me-1"></i>Parámetros del sistema</h6>
          <form id="settings-form" novalidate>
            <div class="mb-3">
              <label class="form-label">Tasa de almacenamiento por defecto (0-1)</label>
              <input type="number" class="form-control" name="defaultHoldingCostRate" min="0" step="0.01" value="${settings.defaultHoldingCostRate}" required>
              <div class="form-text">Se usa como sugerencia al crear un nuevo producto.</div>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" role="switch" id="lowStockNotifications" name="lowStockNotifications" ${settings.lowStockNotifications ? 'checked' : ''}>
              <label class="form-check-label" for="lowStockNotifications">Resaltar productos en estado crítico en el Dashboard</label>
            </div>
            <button type="submit" class="btn sw-btn-accent">Guardar parámetros</button>
          </form>
        </div>
      </div>
    </div>`;

  content.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const { valid, errors } = validateForm(data, { name: [validators.required] });

    form.querySelector('[name="name"]').classList.toggle('is-invalid', Boolean(errors.name));
    if (!valid) return;

    const session = getSession();
    setSession({ ...session, user: { ...session.user, name: data.name.trim() } });
    showSuccess('Perfil actualizado correctamente.');
    renderSettingsPage(container);
  });

  content.querySelector('#settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const rate = Number(data.defaultHoldingCostRate);

    if (!(rate >= 0)) {
      showError('La tasa de almacenamiento debe ser un número válido.');
      return;
    }

    SettingsService.save({
      defaultHoldingCostRate: rate,
      lowStockNotifications: form.querySelector('[name="lowStockNotifications"]').checked,
      currency: 'COP',
    });
    showSuccess('Parámetros guardados correctamente.');
  });
}
