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

// Get all movements
router.get('/movements', getMovements);

// Get a movement by its unique ID
router.get('/movements/:id', getMovement);

// Get all movements linked to a specific product
router.get('/movements/product/:product_id', getMovementsByProductId);

// Create a new movement record
router.post('/movements', createMovement);

// Delete a movement
router.delete('/movements/:id', deleteMovement);

// Update a movement
router.put('/movements/:id', updateMovement);

export default router;