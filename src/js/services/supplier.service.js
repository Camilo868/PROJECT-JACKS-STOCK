/**
 * supplier.service.js — Proveedores.
 *
 * La BD real usa `company_name` y `contact_name` (dos campos distintos:
 * la empresa y la persona de contacto). El mock usaba `name` y `contact`
 * — se mapean directo, es una traducción simple.
 *
 * OJO: el mock también tenía `leadTimeDays` (tiempo de entrega) en el
 * proveedor, pero en la BD real esa columna vive en `products`
 * (lead_time_days), no en `suppliers`. Tiene sentido: el mismo
 * proveedor puede tardar distinto según el producto. Por eso ya NO se
 * edita el lead time acá — se mueve al formulario de productos
 * (ver product.service.js / products.page.js).
 */
import { api } from './api.js';

function fromDb(row) {
  return {
    id: row.id,
    name: row.company_name,
    contact: row.contact_name,
    phone: row.phone || '',
    email: row.email || '',
  };
}

function toDb(payload) {
  return {
    company_name: payload.name,
    contact_name: payload.contact,
    phone: payload.phone,
    email: payload.email,
  };
}

export const SupplierService = {
  getAll: async () => (await api.get('/suppliers')).map(fromDb),
  getById: async (id) => fromDb(await api.get(`/suppliers/${id}`)),
  create: (supplier) => api.post('/suppliers', toDb(supplier)),
  update: (id, supplier) => api.put(`/suppliers/${id}`, toDb(supplier)),
  remove: (id) => api.delete(`/suppliers/${id}`),
};
