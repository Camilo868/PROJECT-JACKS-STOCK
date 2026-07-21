/**
 * suppliers.page.js — CRUD de proveedores.
 */
import { renderLayout } from '../components/layout.js';
import { SupplierService } from '../services/supplier.service.js';
import { openFormModal } from '../components/form-modal.js';
import { confirmDialog } from '../components/confirm-dialog.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { escapeHtml } from '../utils/format.js';

let suppliers = [];
let search = '';

export async function renderSuppliersPage(container) {
  const content = renderLayout(container, { title: 'Proveedores', activePath: '/proveedores' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;
  suppliers = await SupplierService.getAll();
  paint(content);
}

function filtered() {
  const term = search.trim().toLowerCase();
  if (!term) return suppliers;
  return suppliers.filter((s) => s.name.toLowerCase().includes(term) || s.contact.toLowerCase().includes(term));
}

function paint(content) {
  const list = filtered();
  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Proveedores</div>
        <div class="sw-page-subtitle">Datos de contacto de tus proveedores. El lead time (tiempo de entrega) se configura por producto, en la pantalla de Productos.</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-supplier"><i class="bi bi-plus-lg me-1"></i>Nuevo proveedor</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="input-group" style="max-width:320px;">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" id="supplier-search" placeholder="Buscar proveedor o contacto..." value="${escapeHtml(search)}">
        </div>
        <div class="small text-secondary">${list.length} de ${suppliers.length} proveedores</div>
      </div>

      ${list.length === 0 ? `
        <div class="sw-empty-state"><i class="bi bi-truck"></i><div>No se encontraron proveedores.</div></div>` : `
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead><tr><th>Proveedor</th><th>Contacto</th><th>Correo</th><th>Teléfono</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            ${list.map((s) => `
              <tr>
                <td class="fw-semibold">${escapeHtml(s.name)}</td>
                <td>${escapeHtml(s.contact)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td>${escapeHtml(s.phone)}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-light" data-action="edit" data-id="${s.id}"><i class="bi bi-pencil-square"></i></button>
                  <button class="btn btn-sm btn-light text-danger" data-action="delete" data-id="${s.id}"><i class="bi bi-trash3"></i></button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;

  content.querySelector('#btn-new-supplier').addEventListener('click', () => openSupplierModal(content));
  content.querySelector('#supplier-search').addEventListener('input', (e) => { search = e.target.value; paint(content); });

  content.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => openSupplierModal(content, suppliers.find((s) => s.id === btn.dataset.id)));
  });

  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const supplier = suppliers.find((s) => s.id === btn.dataset.id);
      const ok = await confirmDialog(`Se eliminará "${supplier.name}" de tus proveedores.`, 'Eliminar proveedor');
      if (!ok) return;
      try {
        await SupplierService.remove(supplier.id);
        showSuccess('Proveedor eliminado correctamente.');
        suppliers = await SupplierService.getAll();
        paint(content);
      } catch (error) {
        showError(error.message || 'No se pudo eliminar el proveedor.');
      }
    });
  });
}

function openSupplierModal(content, supplier) {
  const isEdit = Boolean(supplier);
  openFormModal({
    title: isEdit ? 'Editar proveedor' : 'Nuevo proveedor',
    submitLabel: isEdit ? 'Guardar cambios' : 'Crear proveedor',
    initialValues: supplier || {},
    fields: [
      { name: 'name', label: 'Nombre del proveedor', required: true },
      { name: 'contact', label: 'Persona de contacto', required: true, colClass: 'col-6' },
      { name: 'phone', label: 'Teléfono', required: true, colClass: 'col-6' },
      { name: 'email', label: 'Correo electrónico', type: 'email', required: true, colClass: 'col-8' },
    ],
    onSubmit: async (values) => {
      const { valid, errors } = validateForm(values, {
        name: [validators.required],
        contact: [validators.required],
        phone: [validators.required],
        email: [validators.required, validators.email],
      });
      if (!valid) throw new Error(Object.values(errors)[0]);

      const payload = {
        name: values.name.trim(),
        contact: values.contact.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      };

      if (isEdit) {
        await SupplierService.update(supplier.id, payload);
        showSuccess('Proveedor actualizado correctamente.');
      } else {
        await SupplierService.create(payload);
        showSuccess('Proveedor creado correctamente.');
      }
      suppliers = await SupplierService.getAll();
      paint(content);
    },
  });
}
