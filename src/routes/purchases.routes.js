import { Router } from 'express';
import { 
    getPurchases, 
    getPurchase, 
    getPurchasesBySupplierId,
    createPurchase,
    deletePurchase,
    updatePurchase,
    updatePurchaseStatus 
                    } from '../controllers/purchases.controller.js';

const router = Router();

// Get all purchases
router.get('/purchases', getPurchases);

// Get the purchase history for a specific supplier
router.get('/purchases/supplier/:supplier_id', getPurchasesBySupplierId);

// Get a purchase by its unique ID
router.get('/purchases/:id', getPurchase);

// Register a new purchase
router.post('/purchases', createPurchase);

// Delete a purchase
router.delete('/purchases/:id', deletePurchase);

// Update a purchase
router.put('/purchases/:id', updatePurchase);

// Update only the status (pending/received/cancelled)
router.patch('/purchases/:id/status', updatePurchaseStatus);

export default router;