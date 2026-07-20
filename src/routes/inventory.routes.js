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

// Obtener todo el inventario
router.get('/inventory', getInventories);

// Obtener por ID único de registro
router.get('/inventory/:id', getInventory);

// Obtener todos los registros vinculados a un producto específico
router.get('/inventory/product/:product_id', getInventoryByProductId);

// Crear registro de inventario
router.post('/inventory', createInventory);

// Eliminar registro de inventario
router.delete('/inventory/:id', deleteInventory);

// Actualizar registro de inventario
router.put('/inventory/:id', updateInventory);

export default router;