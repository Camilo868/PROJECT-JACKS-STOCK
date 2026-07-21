import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM suppliers');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a supplier by ID
export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Supplier not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a supplier by company name
export const getSupplierByCompanyName = async (req, res) => {
  try {
    const { company_name } = req.params;
    const { rows } = await pool.query('SELECT * FROM suppliers WHERE company_name = $1', [company_name]);

    if (rows.length === 0) return notFound(res, 'No supplier found with that company name');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const data = req.body;
    const queryText = 'INSERT INTO suppliers (company_name, contact_name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [data.company_name, data.contact_name, data.phone, data.email];

    const { rows } = await pool.query(queryText, values);
    return created(res, rows[0], 'Supplier created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Supplier not found');
    return ok(res, null, 'Supplier deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const queryText = 'UPDATE suppliers SET company_name = $1, contact_name = $2, phone = $3, email = $4 WHERE id = $5 RETURNING *';
    const values = [data.company_name, data.contact_name, data.phone, data.email, id];

    const { rows } = await pool.query(queryText, values);

    if (rows.length === 0) return notFound(res, 'Supplier not found');
    return ok(res, rows[0], 'Supplier updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
