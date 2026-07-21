/**
 * suppliers.page.js — Supplier CRUD.
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
  const content = renderLayout(container, { title: 'Suppliers', activePath: '/suppliers' });
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
        <div class="sw-page-title">Suppliers</div>
        <div class="sw-page-subtitle">Contact details for your suppliers. Lead time is configured per product, on the Products screen.</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-supplier"><i class="bi bi-plus-lg me-1"></i>New supplier</button>
    </div>

    <div class="sw-card p-3 p-lg-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="input-group" style="max-width:320px;">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" id="supplier-search" placeholder="Search supplier or contact..." value="${escapeHtml(search)}">
        </div>
        <div class="small text-secondary">${list.length} of ${suppliers.length} suppliers</div>
      </div>

      ${list.length === 0 ? `
        <div class="sw-empty-state"><i class="bi bi-truck"></i><div>No suppliers found.</div></div>` : `
      <div class="table-responsive">
        <table class="table sw-table align-middle mb-0">
          <thead><tr><th>Supplier</th><th>Contact</th><th>Email</th><th>Phone</th><th class="text-end">Actions</th></tr></thead>
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
    btn.addEventListener('click', () => openSupplierModal(content, suppliers.find((s) => String(s.id) === String(btn.dataset.id))));
  });

  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const supplier = suppliers.find((s) => String(s.id) === String(btn.dataset.id));
      if (!supplier) return;
      const ok = await confirmDialog(`"${supplier.name}" will be removed from your suppliers.`, 'Delete supplier');
      if (!ok) return;
      try {
        await SupplierService.remove(supplier.id);
        showSuccess('Supplier deleted successfully.');
        suppliers = await SupplierService.getAll();
        paint(content);
      } catch (error) {
        showError(error.message || 'Could not delete the supplier.');
      }
    });
  });
}

function openSupplierModal(content, supplier) {
  const isEdit = Boolean(supplier);
  openFormModal({
    title: isEdit ? 'Edit supplier' : 'New supplier',
    submitLabel: isEdit ? 'Save changes' : 'Create supplier',
    initialValues: supplier || {},
    fields: [
      { name: 'name', label: 'Supplier name', required: true },
      { name: 'contact', label: 'Contact person', required: true, colClass: 'col-6' },
      { name: 'phone', label: 'Phone', required: true, colClass: 'col-6' },
      { name: 'email', label: 'Email', type: 'email', required: true, colClass: 'col-8' },
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
        showSuccess('Supplier updated successfully.');
      } else {
        await SupplierService.create(payload);
        showSuccess('Supplier created successfully.');
      }
      suppliers = await SupplierService.getAll();
      paint(content);
    },
  });
}
