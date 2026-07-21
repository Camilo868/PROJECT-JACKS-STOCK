import { Router } from 'express';
import { 
    getPurchaseDetails, 
    getPurchaseDetail, 
    getDetailsByPurchaseId,
    createPurchaseDetail,
    deletePurchaseDetail,
    updatePurchaseDetail 
} from '../controllers/purchase_details.controller.js';

const router = Router();

// Get all purchase details globally
router.get('/purchase-details', getPurchaseDetails);

// Get a purchase detail by its unique record ID
router.get('/purchase-details/:id', getPurchaseDetail);

// Get the full item breakdown using the parent purchase ID
router.get('/purchase-details/purchase/:purchase_id', getDetailsByPurchaseId);

// Add an item/detail to a purchase
router.post('/purchase-details', createPurchaseDetail);

// Delete a purchase detail
router.delete('/purchase-details/:id', deletePurchaseDetail);

// Modify the quantity or price of a purchase detail
router.put('/purchase-details/:id', updatePurchaseDetail);

export default router;