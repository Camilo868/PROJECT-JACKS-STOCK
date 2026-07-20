import { Router } from 'express';
import { 
    getMovements, 
    getMovement, 
    getMovementsByProductId,
    createMovement,
    deleteMovement,
    updateMovement 
                    } from '../controllers/movements.controller.js';

const router = Router();

// Obtener todos los movimientos
router.get('/movements', getMovements);

// Obtener un movimiento por su ID único
router.get('/movements/:id', getMovement);

// Obtener todos los movimientos asociados a un producto específico
router.get('/movements/product/:product_id', getMovementsByProductId);

// Crear un nuevo registro de movimiento
router.post('/movements', createMovement);

// Eliminar un movimiento
router.delete('/movements/:id', deleteMovement);

// Actualizar un movimiento
router.put('/movements/:id', updateMovement);

export default router;