import { Router } from 'express';
import { 
    getInventories, 
    getInventory, 
    getInventoryByProductId,
    createInventory,
    deleteInventory,
    updateInventory 
                    } from '../controllers/inventory.controller.js';

const router = Router();

// Get all inventory
router.get('/inventory', getInventories);

// Get by unique record ID
router.get('/inventory/:id', getInventory);

// Get all records linked to a specific product
router.get('/inventory/product/:product_id', getInventoryByProductId);

// Create an inventory record
router.post('/inventory', createInventory);

// Delete an inventory record
router.delete('/inventory/:id', deleteInventory);

// Update an inventory record
router.put('/inventory/:id', updateInventory);

export default router;