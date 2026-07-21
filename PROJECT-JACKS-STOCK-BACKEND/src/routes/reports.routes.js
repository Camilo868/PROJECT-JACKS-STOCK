import { Router } from 'express';
import { getEoqReport, getMovementsSummary, getStockByProduct } from '../controllers/reports.controller.js';

const router = Router();

// EOQ / ROP calculated entirely in SQL
router.get('/reports/eoq', getEoqReport);

// Movements grouped by type (IN / OUT)
router.get('/reports/movements-summary', getMovementsSummary);

// Total stock per product across all warehouses
router.get('/reports/stock-by-product', getStockByProduct);

export default router;
