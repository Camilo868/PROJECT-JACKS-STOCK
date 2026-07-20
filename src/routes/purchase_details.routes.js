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

// Obtener todos los detalles de compras globales
router.get('/purchase-details', getPurchaseDetails);

// Obtener un detalle de compra por su ID único de registro
router.get('/purchase-details/:id', getPurchaseDetail);

// Obtener el desglose completo de artículos usando el ID de la compra principal
router.get('/purchase-details/purchase/:purchase_id', getDetailsByPurchaseId);

// Agregar un artículo/detalle a una compra
router.post('/purchase-details', createPurchaseDetail);

// Eliminar un detalle de la compra
router.delete('/purchase-details/:id', deletePurchaseDetail);

// Modificar cantidad o precio de un detalle de compra
router.put('/purchase-details/:id', updatePurchaseDetail);

export default router;