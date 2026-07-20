/**
 * confirm-dialog.js
 * Modal de confirmación reutilizable (ej. antes de eliminar un registro).
 */

let dialogEl = null;

function ensureDialog() {
  if (dialogEl) return dialogEl;

  dialogEl = document.createElement('div');
  dialogEl.className = 'modal fade';
  dialogEl.tabIndex = -1;
  dialogEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body p-4 text-center">
          <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle" style="width:56px;height:56px;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
          </div>
          <h5 class="confirm-title mb-2">¿Confirmar acción?</h5>
          <p class="confirm-message text-secondary mb-4"></p>
          <div class="d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-light px-4" data-action="cancel">Cancelar</button>
            <button type="button" class="btn btn-danger px-4" data-action="confirm">Sí, continuar</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dialogEl);
  return dialogEl;
}

/**
 * Muestra un modal de confirmación y resuelve con true/false.
 * @param {string} message
 * @param {string} [title]
 * @returns {Promise<boolean>}
 */
export function confirmDialog(message, title = '¿Confirmar acción?') {
  const el = ensureDialog();
  el.querySelector('.confirm-title').textContent = title;
  el.querySelector('.confirm-message').textContent = message;

  const modal = new bootstrap.Modal(el);

  return new Promise((resolve) => {
    const onClick = (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      cleanup();
      modal.hide();
      resolve(action === 'confirm');
    };

    const onHidden = () => {
      cleanup();
      resolve(false);
    };

    function cleanup() {
      el.removeEventListener('click', onClick);
      el.removeEventListener('hidden.bs.modal', onHidden);
    }

    el.addEventListener('click', onClick);
    el.addEventListener('hidden.bs.modal', onHidden, { once: true });
    modal.show();
  });
}
