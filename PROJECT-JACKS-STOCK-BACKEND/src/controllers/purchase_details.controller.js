import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all purchase detail records
export const getPurchaseDetails = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM purchase_details');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a single purchase detail by its own ID
export const getPurchaseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM purchase_details WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Purchase detail not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get every line item that belongs to a given purchase order
export const getDetailsByPurchaseId = async (req, res) => {
  try {
    const { purchase_id } = req.params;
    const { rows } = await pool.query('SELECT * FROM purchase_details WHERE purchase_id = $1', [purchase_id]);
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Add a new line item to a purchase order
export const createPurchaseDetail = async (req, res) => {
  try {
    const data = req.body;
    const { rows } = await pool.query(
      'INSERT INTO purchase_details (purchase_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.purchase_id, data.product_id, data.quantity, data.unit_price],
    );
    return created(res, rows[0], 'Purchase detail created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a purchase detail
export const deletePurchaseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM purchase_details WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Purchase detail not found');
    return ok(res, null, 'Purchase detail deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing purchase detail
export const updatePurchaseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const queryText = 'UPDATE purchase_details SET purchase_id = $1, product_id = $2, quantity = $3, unit_price = $4 WHERE id = $5 RETURNING *';
    const values = [data.purchase_id, data.product_id, data.quantity, data.unit_price, id];

    const { rows } = await pool.query(queryText, values);

    if (rows.length === 0) return notFound(res, 'Purchase detail not found');
    return ok(res, rows[0], 'Purchase detail updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
