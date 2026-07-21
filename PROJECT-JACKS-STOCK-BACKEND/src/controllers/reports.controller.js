import { pool } from '../../config/db.js';
import { ok, fail } from '../utils/response.js';

/**
 * EOQ / ROP report — uses the exact SQL from BDT + queries.sql
 * ("La que calcula todo con un boton"). All the math (EOQ, orders per
 * year, days between orders, reorder point) happens in the database;
 * the frontend only displays the numbers.
 */
export const getEoqReport = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        annual_demand,
        daily_demand,
        lead_time_days,
        ROUND(SQRT((2.0 * annual_demand * ordering_cost) / holding_cost), 2) AS economic_order_quantity,
        ROUND(annual_demand / SQRT((2.0 * annual_demand * ordering_cost) / holding_cost), 2) AS orders_per_year,
        ROUND(365 / (annual_demand / SQRT((2.0 * annual_demand * ordering_cost) / holding_cost)), 2) AS days_between_orders,
        (lead_time_days * daily_demand) AS reorder_point
      FROM products
    `);
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

/** Movement count by type ('IN' / 'OUT'), same as query #20 in the SQL file. */
export const getMovementsSummary = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT movement_type, COUNT(*) AS total_movements
      FROM movements
      GROUP BY movement_type
    `);
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

/** Total stored units per product, same as query #19 in the SQL file. */
export const getStockByProduct = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name AS product, SUM(i.quantity) AS total_quantity
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      GROUP BY p.id, p.name
    `);
    return ok(res, rows);
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
