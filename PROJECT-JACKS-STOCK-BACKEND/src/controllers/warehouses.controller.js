import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all warehouses
export const getWarehouses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM warehouses');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a warehouse by ID
export const getWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM warehouses WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Warehouse not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a warehouse by name
export const getWarehouseByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { rows } = await pool.query('SELECT * FROM warehouses WHERE name = $1', [name]);

    if (rows.length === 0) return notFound(res, 'Warehouse not found');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

/**
 * Get remaining capacity for every warehouse (or one, via ?warehouse_id=).
 * Uses the exact query from BDT + queries.sql — the calculation always
 * lives in SQL, the frontend only displays the result.
 */
export const getWarehouseCapacity = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        w.id,
        w.name AS warehouse_name,
        w.capacity AS total_capacity,
        COALESCE(SUM(i.quantity), 0) AS used_capacity,
        (w.capacity - COALESCE(SUM(i.quantity), 0)) AS remaining_capacity
      FROM warehouses w
      LEFT JOIN inventory i ON w.id = i.warehouse_id
      GROUP BY w.id, w.name, w.capacity
      ORDER BY w.id
    `);
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Create a new warehouse
export const createWarehouse = async (req, res) => {
  try {
    const data = req.body;
    const { rows } = await pool.query(
      'INSERT INTO warehouses (name, location, capacity, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.location, data.capacity, data.user_id],
    );
    return created(res, rows[0], 'Warehouse created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a warehouse
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM warehouses WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Warehouse not found');
    return ok(res, null, 'Warehouse deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing warehouse
// NOTE: the previous version of this function queried a misspelled
// table ("Waterhouses") using the users columns (last_name, email,
// password) instead of the warehouses columns. Fixed below.
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const { rows } = await pool.query(
      'UPDATE warehouses SET name = $1, location = $2, capacity = $3, user_id = $4 WHERE id = $5 RETURNING *',
      [data.name, data.location, data.capacity, data.user_id, id],
    );

    if (rows.length === 0) return notFound(res, 'Warehouse not found');
    return ok(res, rows[0], 'Warehouse updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
