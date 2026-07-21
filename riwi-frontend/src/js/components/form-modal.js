/**
 * form-modal.js
 * Generates a Bootstrap modal with a form from a declarative field
 * schema. Reused by every CRUD module to avoid duplicating modal
 * HTML.
 *
 * Field: { name, label, type, required, options?, step?, min?, placeholder?, colClass? }
 * type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'date'
 */
import { escapeHtml } from '../utils/format.js';

function renderField(field, value) {
  const val = value ?? '';
  const requiredAttr = field.required ? 'required' : '';
  const col = field.colClass || 'col-12';

  let control = '';

  if (field.type === 'select') {
    const options = field.options.map((opt) => (
      `<option value="${escapeHtml(opt.value)}" ${String(opt.value) === String(val) ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
    )).join('');
    control = `
      <select class="form-select" id="field-${field.name}" name="${field.name}" ${requiredAttr}>
        <option value="" disabled ${val === '' ? 'selected' : ''}>Select an option</option>
        ${options}
      </select>`;
  } else if (field.type === 'textarea') {
    control = `<textarea class="form-control" id="field-${field.name}" name="${field.name}" rows="3" placeholder="${escapeHtml(field.placeholder || '')}" ${requiredAttr}>${escapeHtml(val)}</textarea>`;
  } else {
    control = `<input
      type="${field.type || 'text'}"
      class="form-control"
      id="field-${field.name}"
      name="${field.name}"
      value="${escapeHtml(val)}"
      placeholder="${escapeHtml(field.placeholder || '')}"
      ${field.step !== undefined ? `step="${field.step}"` : ''}
      ${field.min !== undefined ? `min="${field.min}"` : ''}
      ${requiredAttr}
    />`;
  }

  return `
    <div class="${col}">
      <label class="form-label" for="field-${field.name}">${escapeHtml(field.label)}</label>
      ${control}
      <div class="invalid-feedback" data-error-for="${field.name}"></div>
    </div>`;
}

let modalEl = null;

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.className = 'modal fade';
  modalEl.tabIndex = -1;
  document.body.appendChild(modalEl);
  return modalEl;
}

/**
 * Opens a modal with a form.
 * @param {object} config
 * @param {string} config.title
 * @param {Array} config.fields
 * @param {object} [config.initialValues]
 * @param {(values: object) => Promise<void>|void} config.onSubmit
 * @param {string} [config.submitLabel]
 */
export function openFormModal({ title, fields, initialValues = {}, onSubmit, submitLabel = 'Save' }) {
  const el = ensureModal();

  el.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">${escapeHtml(title)}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form novalidate>
          <div class="modal-body">
            <div class="row g-3">
              ${fields.map((f) => renderField(f, initialValues[f.name])).join('')}
            </div>
            <div class="alert alert-danger mt-3 d-none" data-form-error></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn sw-btn-accent">
              <span class="submit-label">${escapeHtml(submitLabel)}</span>
              <span class="spinner-border spinner-border-sm ms-1 d-none" data-submit-spinner></span>
            </button>
          </div>
        </form>
      </div>
    </div>`;

  const modal = new bootstrap.Modal(el);
  const form = el.querySelector('form');
  const errorBox = el.querySelector('[data-form-error]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn.querySelector('[data-submit-spinner]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('d-none');
    form.querySelectorAll('.is-invalid').forEach((n) => n.classList.remove('is-invalid'));

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    try {
      await onSubmit(values);
      modal.hide();
    } catch (error) {
      errorBox.textContent = error.message || 'An error occurred while saving. Please try again.';
      errorBox.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
    }
  });

  modal.show();
  return modal;
}
