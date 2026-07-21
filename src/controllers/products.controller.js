import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a product by ID
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Product not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a product by name
export const getProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { rows } = await pool.query('SELECT * FROM products WHERE name = $1', [name]);

    if (rows.length === 0) return notFound(res, 'Product not found');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const data = req.body;
    const queryText = `INSERT INTO products (category_id, supplier_id, name, description, unit_price, annual_demand, ordering_cost, 
            holding_cost, lead_time_days, daily_demand) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    const values = [data.category_id, data.supplier_id, data.name, data.description, data.unit_price, data.annual_demand, data.ordering_cost,
      data.holding_cost, data.lead_time_days, data.daily_demand];

    const { rows } = await pool.query(queryText, values);
    return created(res, rows[0], 'Product created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Product not found');
    return ok(res, null, 'Product deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const queryText = `UPDATE products SET category_id = $1, supplier_id = $2, name = $3, description = $4, unit_price = $5, annual_demand = $6, 
            ordering_cost = $7, holding_cost = $8, lead_time_days = $9, daily_demand = $10 WHERE id = $11 RETURNING *`;

    const values = [data.category_id, data.supplier_id, data.name, data.description, data.unit_price, data.annual_demand, data.ordering_cost,
      data.holding_cost, data.lead_time_days, data.daily_demand, id];

    const { rows } = await pool.query(queryText, values);

    if (rows.length === 0) return notFound(res, 'Product not found');
    return ok(res, rows[0], 'Product updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
