/**
 * toast.js
 * Toast notifications (success, error, info) using Bootstrap Toasts.
 */

const ICONS = {
  success: 'bi-check-circle-fill text-success',
  error: 'bi-x-circle-fill text-danger',
  info: 'bi-info-circle-fill text-primary',
  warning: 'bi-exclamation-triangle-fill text-warning',
};

/**
 * Shows a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${ICONS[type] || ICONS.info}"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;

  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

export function showSuccess(message) { showToast(message, 'success'); }
export function showError(message) { showToast(message, 'error'); }
