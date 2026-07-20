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

// Obtener todos los proveedores
router.get('/suppliers', getSuppliers);

// Obtener un proveedor por su ID único
router.get('/suppliers/:id', getSupplier);

// Buscar proveedores por el nombre de la empresa
router.get('/suppliers/search/:company_name', getSupplierByCompanyName);

// Crear un nuevo proveedor
router.post('/suppliers', createSupplier);

// Eliminar un proveedor
router.delete('/suppliers/:id', deleteSupplier);

// Actualizar un proveedor
router.put('/suppliers/:id', updateSupplier);

export default router;