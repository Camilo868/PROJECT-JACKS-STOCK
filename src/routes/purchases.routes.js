import { Router } from 'express';
import { 
    getPurchases, 
    getPurchase, 
    getPurchasesBySupplierId,
    createPurchase,
    deletePurchase,
    updatePurchase 
                    } from '../controllers/purchases.controller.js';

const router = Router();

// Obtener todas las compras
router.get('/purchases', getPurchases);

// Obtener una compra por su ID único
router.get('/purchases/:id', getPurchase);

// Obtener el historial de compras de un proveedor específico
router.get('/purchases/supplier/:supplier_id', getPurchasesBySupplierId);

// Registrar una nueva compra
router.post('/purchases', createPurchase);

// Eliminar una compra
router.delete('/purchases/:id', deletePurchase);

// Actualizar una compra
router.put('/purchases/:id', updatePurchase);

export default router;