/**
 * supplier.service.js — Suppliers.
 *
 * The real DB uses `company_name` and `contact_name` (two different
 * fields: the company and the contact person). Mapped directly to
 * `name` and `contact`.
 *
 * NOTE: the lead time (`leadTimeDays`) is NOT edited here — it lives
 * on `products.lead_time_days` in the real database, since the same
 * supplier can have a different lead time depending on the product.
 * See product.service.js / products.page.js.
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
