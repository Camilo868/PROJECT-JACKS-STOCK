import { Router } from 'express';
import { 
    getProducts, 
    getProduct, 
    getProductByName,
    createProduct,
    deleteProduct,
    updateProduct 
                    } from '../controllers/products.controller.js';

const router = Router();

// Obtener todos los productos
router.get('/products', getProducts);

// Obtener por ID único
router.get('/products/:id', getProduct);

// Obtener por nombre exacto
router.get('/products/search/:name', getProductByName);

// Crear un producto
router.post('/products', createProduct);

// Eliminar un producto
router.delete('/products/:id', deleteProduct);

// Actualizar un producto
router.put('/products/:id', updateProduct);

export default router;