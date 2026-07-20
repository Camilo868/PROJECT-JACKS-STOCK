import { Router } from 'express';
import { getWarehouses, 
        getWarehouse, 
        getWarehouseByName,
        createWarehouse,
        deleteWarehouse,
        updateWarehouse 
                        } from '../controllers/warehouses.controller.js';


const router = Router();

// Obtener todos los almacenes
router.get('/warehouses', getWarehouses);

// Obtener un almacén por ID
router.get('/warehouses/:id', getWarehouse);

// Buscar un almacén por su nombre
router.get('/warehouses/search/:name', getWarehouseByName);

// Crear un nuevo almacén
router.post('/warehouses', createWarehouse);

// Eliminar un almacén
router.delete('/warehouses/:id', deleteWarehouse);

// Actualizar un almacén existente
router.put('/warehouses/:id', updateWarehouse);

export default router;