/**
 * settings.page.js
 * User profile and general system settings.
 */
import { renderLayout } from '../components/layout.js';
import { getCurrentUser, setSession, getSession } from '../core/session.js';
import { SettingsService } from '../services/settings.service.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { escapeHtml } from '../utils/format.js';

export async function renderSettingsPage(container) {
  const content = renderLayout(container, { title: 'Settings', activePath: '/settings' });
  const user = getCurrentUser();
  const settings = SettingsService.get();

  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Settings</div>
        <div class="sw-page-subtitle">Your account details and general system settings.</div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-person-circle me-1"></i>Profile</h6>
          <form id="profile-form" novalidate>
            <div class="mb-3">
              <label class="form-label">Full name</label>
              <input type="text" class="form-control" name="name" value="${escapeHtml(user?.name || '')}" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" name="email" value="${escapeHtml(user?.email || '')}" disabled>
              <div class="form-text">Email cannot be changed in this version.</div>
            </div>
            <button type="submit" class="btn sw-btn-accent">Save changes</button>
          </form>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="sw-card p-3 p-lg-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-sliders me-1"></i>System settings</h6>
          <form id="settings-form" novalidate>
            <div class="mb-3">
              <label class="form-label">Default holding rate</label>
              <input type="number" class="form-control" name="defaultHoldingCost" min="0" step="1" value="${settings.defaultHoldingCost}" required>
              <div class="form-text">Whole number, set by the administrator. Used as-is to pre-fill the holding rate when creating a new product.</div>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" role="switch" id="lowStockNotifications" name="lowStockNotifications" ${settings.lowStockNotifications ? 'checked' : ''}>
              <label class="form-check-label" for="lowStockNotifications">Highlight critical-status products on the Dashboard</label>
            </div>
            <button type="submit" class="btn sw-btn-accent">Save settings</button>
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
    showSuccess('Profile updated successfully.');
    renderSettingsPage(container);
  });

  content.querySelector('#settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const rate = Number(data.defaultHoldingCost);

    if (!Number.isInteger(rate) || rate < 0) {
      showError('The holding rate must be a whole number.');
      return;
    }

    SettingsService.save({
      defaultHoldingCost: rate,
      lowStockNotifications: form.querySelector('[name="lowStockNotifications"]').checked,
      currency: 'COP',
    });
    showSuccess('Settings saved successfully.');
  });
}
