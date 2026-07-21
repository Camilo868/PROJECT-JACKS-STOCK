import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all movements
export const getMovements = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM movements');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a movement by ID
export const getMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM movements WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Movement not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get movement history for a specific product
export const getMovementsByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { rows } = await pool.query('SELECT * FROM movements WHERE product_id = $1', [product_id]);
    // Empty history is valid (a brand new product), not an error.
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Register a new movement
export const createMovement = async (req, res) => {
  try {
    const data = req.body;
    const queryText = 'INSERT INTO movements (product_id, warehouse_id, movement_type, quantity, movement_date) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [data.product_id, data.warehouse_id, data.movement_type, data.quantity, data.movement_date];

    const { rows } = await pool.query(queryText, values);
    return created(res, rows[0], 'Movement registered successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a movement
export const deleteMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM movements WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Movement not found');
    return ok(res, null, 'Movement deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing movement
export const updateMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const queryText = 'UPDATE movements SET product_id = $1, warehouse_id = $2, movement_type = $3, quantity = $4, movement_date = $5 WHERE id = $6 RETURNING *';
    const values = [data.product_id, data.warehouse_id, data.movement_type, data.quantity, data.movement_date, id];

    const { rows } = await pool.query(queryText, values);

    if (rows.length === 0) return notFound(res, 'Movement not found');
    return ok(res, rows[0], 'Movement updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
