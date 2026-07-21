import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all inventory records
export const getInventories = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM inventory');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a single inventory record by ID
export const getInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Inventory record not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get inventory records for a specific product (across all warehouses)
export const getInventoryByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { rows } = await pool.query('SELECT * FROM inventory WHERE product_id = $1', [product_id]);
    // Returns an empty list instead of 404 — a product with no stock
    // yet is a valid state, not an error.
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Create a new inventory record
export const createInventory = async (req, res) => {
  try {
    const data = req.body;
    const { rows } = await pool.query(
      'INSERT INTO inventory (warehouse_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [data.warehouse_id, data.product_id, data.quantity],
    );
    return created(res, rows[0], 'Inventory record created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete an inventory record
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Inventory record not found');
    return ok(res, null, 'Inventory record deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an inventory record (e.g. stock quantity)
export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const { rows } = await pool.query(
      'UPDATE inventory SET warehouse_id = $1, product_id = $2, quantity = $3 WHERE id = $4 RETURNING *',
      [data.warehouse_id, data.product_id, data.quantity, id],
    );

    if (rows.length === 0) return notFound(res, 'Inventory record not found');
    return ok(res, rows[0], 'Inventory record updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
