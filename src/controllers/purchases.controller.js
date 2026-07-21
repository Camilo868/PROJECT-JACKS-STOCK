import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all purchase orders
export const getPurchases = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM purchases');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a purchase order by ID
export const getPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM purchases WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Purchase not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get purchase history for a specific supplier
export const getPurchasesBySupplierId = async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const { rows } = await pool.query('SELECT * FROM purchases WHERE supplier_id = $1', [supplier_id]);
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Register a new purchase order
export const createPurchase = async (req, res) => {
  try {
    const data = req.body;
    const queryText = 'INSERT INTO purchases (supplier_id, purchase_date, total, status) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [data.supplier_id, data.purchase_date, data.total, data.status || 'pending'];

    const { rows } = await pool.query(queryText, values);
    return created(res, rows[0], 'Purchase created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a purchase order
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM purchases WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Purchase not found');
    return ok(res, null, 'Purchase deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing purchase order
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const queryText = 'UPDATE purchases SET supplier_id = $1, purchase_date = $2, total = $3, status = $4 WHERE id = $5 RETURNING *';
    const values = [data.supplier_id, data.purchase_date, data.total, data.status, id];

    const { rows } = await pool.query(queryText, values);

    if (rows.length === 0) return notFound(res, 'Purchase not found');
    return ok(res, rows[0], 'Purchase updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update only the status of a purchase order (pendiente/recibida/cancelada)
export const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { rows } = await pool.query('UPDATE purchases SET status = $1 WHERE id = $2 RETURNING *', [status, id]);

    if (rows.length === 0) return notFound(res, 'Purchase not found');
    return ok(res, rows[0], 'Purchase status updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
