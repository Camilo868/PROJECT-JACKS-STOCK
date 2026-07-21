import { Router } from 'express';
import { 
    getSuppliers, 
    getSupplier, 
    getSupplierByCompanyName,
    createSupplier,
    deleteSupplier,
    updateSupplier 
                    } from '../controllers/suppliers.controller.js';

const router = Router();

// Get all suppliers
router.get('/suppliers', getSuppliers);

// Get a supplier by its unique ID
router.get('/suppliers/:id', getSupplier);

// Find suppliers by company name
router.get('/suppliers/search/:company_name', getSupplierByCompanyName);

// Create a new supplier
router.post('/suppliers', createSupplier);

// Delete a supplier
router.delete('/suppliers/:id', deleteSupplier);

// Update a supplier
router.put('/suppliers/:id', updateSupplier);

export default router;