/**
 * warehouses.page.js — CRUD de bodegas.
 */
import { renderLayout } from '../components/layout.js';
import { WarehouseService } from '../services/warehouse.service.js';
import { openFormModal } from '../components/form-modal.js';
import { confirmDialog } from '../components/confirm-dialog.js';
import { showSuccess, showError } from '../components/toast.js';
import { validateForm, validators } from '../utils/validators.js';
import { escapeHtml } from '../utils/format.js';

let warehouses = [];
let capacity = [];

export async function renderWarehousesPage(container) {
  const content = renderLayout(container, { title: 'Bodegas', activePath: '/bodegas' });
  content.innerHTML = `<div class="sw-loading"><div class="spinner-border" style="color:var(--sw-accent);"></div></div>`;
  await loadData();
  paint(content);
}

async function loadData() {
  [warehouses, capacity] = await Promise.all([WarehouseService.getAll(), WarehouseService.getCapacity()]);
}

function getCapacityInfo(warehouseId) {
  return capacity.find((c) => String(c.id) === String(warehouseId));
}

function paint(content) {
  content.innerHTML = `
    <div class="sw-page-header">
      <div>
        <div class="sw-page-title">Bodegas</div>
        <div class="sw-page-subtitle">Ubicaciones físicas donde se almacena el inventario.</div>
      </div>
      <button class="btn sw-btn-accent" id="btn-new-warehouse"><i class="bi bi-plus-lg me-1"></i>Nueva bodega</button>
    </div>

    <div class="row g-3">
      ${warehouses.length === 0 ? `
        <div class="col-12"><div class="sw-card p-4 sw-empty-state"><i class="bi bi-building"></i><div>No hay bodegas registradas.</div></div></div>` :
        warehouses.map((w) => {
          const info = getCapacityInfo(w.id);
          return `
        <div class="col-md-6 col-lg-4">
          <div class="sw-card p-3 p-lg-4 h-100">
            <div class="d-flex justify-content-between align-items-start">
              <div class="sw-kpi-icon mb-2" style="background:var(--sw-accent-soft); color:var(--sw-accent-dark);"><i class="bi bi-building"></i></div>
              <div>
                <button class="btn btn-sm btn-light" data-action="edit" data-id="${w.id}"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-light text-danger" data-action="delete" data-id="${w.id}"><i class="bi bi-trash3"></i></button>
              </div>
            </div>
            <div class="fw-bold fs-5">${escapeHtml(w.name)}</div>
            <div class="text-secondary small mb-2"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(w.location)}</div>
            ${info && info.totalCapacity != null ? `
              <div class="small text-secondary d-flex justify-content-between">
                <span>Espacio disponible</span>
                <span class="fw-semibold ${info.remainingCapacity < 0 ? 'text-danger' : ''}">${info.remainingCapacity} / ${info.totalCapacity} un.</span>
              </div>` : `
              <div class="small text-secondary">Sin capacidad máxima definida.</div>`}
          </div>
        </div>`;
        }).join('')}
    </div>`;

  content.querySelector('#btn-new-warehouse').addEventListener('click', () => openWarehouseModal(content));

  content.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => openWarehouseModal(content, warehouses.find((w) => w.id === btn.dataset.id)));
  });

  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const warehouse = warehouses.find((w) => w.id === btn.dataset.id);
      const ok = await confirmDialog(`Se eliminará la bodega "${warehouse.name}".`, 'Eliminar bodega');
      if (!ok) return;
      try {
        await WarehouseService.remove(warehouse.id);
        showSuccess('Bodega eliminada correctamente.');
        await loadData();
        paint(content);
      } catch (error) {
        showError(error.message || 'No se pudo eliminar la bodega.');
      }
    });
  });
}

function openWarehouseModal(content, warehouse) {
  const isEdit = Boolean(warehouse);
  openFormModal({
    title: isEdit ? 'Editar bodega' : 'Nueva bodega',
    submitLabel: isEdit ? 'Guardar cambios' : 'Crear bodega',
    initialValues: warehouse || {},
    fields: [
      { name: 'name', label: 'Nombre de la bodega', required: true },
      { name: 'location', label: 'Ubicación', required: true },
      { name: 'capacity', label: 'Capacidad máxima (un.)', type: 'number', min: 0, step: '1', required: true },
    ],
    onSubmit: async (values) => {
      const { valid, errors } = validateForm(values, {
        name: [validators.required],
        location: [validators.required],
        capacity: [validators.required, validators.nonNegativeNumber],
      });
      if (!valid) throw new Error(Object.values(errors)[0]);

      const payload = { name: values.name.trim(), location: values.location.trim(), capacity: Number(values.capacity) };

      if (isEdit) {
        await WarehouseService.update(warehouse.id, payload);
        showSuccess('Bodega actualizada correctamente.');
      } else {
        await WarehouseService.create(payload);
        showSuccess('Bodega creada correctamente.');
      }
      await loadData();
      paint(content);
    },
  });
}
