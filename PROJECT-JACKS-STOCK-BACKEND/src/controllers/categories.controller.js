import { pool } from '../../config/db.js';
import { ok, created, fail, notFound } from '../utils/response.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a category by ID
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'Category not found');
    return ok(res, rows[0]);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a category by name
export const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { rows } = await pool.query('SELECT * FROM categories WHERE name = $1', [name]);

    if (rows.length === 0) return notFound(res, 'Category not found');
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const data = req.body;
    const { rows } = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [data.name]);
    return created(res, rows[0], 'Category created successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'Category not found');
    return ok(res, null, 'Category deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { rows } = await pool.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [data.name, id]);

    if (rows.length === 0) return notFound(res, 'Category not found');
    return ok(res, rows[0], 'Category updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
