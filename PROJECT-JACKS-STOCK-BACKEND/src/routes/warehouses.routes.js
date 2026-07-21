import { Router } from 'express';
import { getWarehouses, 
        getWarehouse, 
        getWarehouseByName,
        getWarehouseCapacity,
        createWarehouse,
        deleteWarehouse,
        updateWarehouse 
                        } from '../controllers/warehouses.controller.js';


const router = Router();

// Get all warehouses
router.get('/warehouses', getWarehouses);

// Available space per warehouse (calculated in SQL)
router.get('/warehouses/capacity', getWarehouseCapacity);

// Get a warehouse by ID
router.get('/warehouses/:id', getWarehouse);

// Find a warehouse by name
router.get('/warehouses/search/:name', getWarehouseByName);

// Create a new warehouse
router.post('/warehouses', createWarehouse);

// Delete a warehouse
router.delete('/warehouses/:id', deleteWarehouse);

// Update an existing warehouse
router.put('/warehouses/:id', updateWarehouse);

export default router;