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

// Get all products
router.get('/products', getProducts);

// Get by unique ID
router.get('/products/:id', getProduct);

// Get by exact name
router.get('/products/search/:name', getProductByName);

// Create a product
router.post('/products', createProduct);

// Delete a product
router.delete('/products/:id', deleteProduct);

// Update a product
router.put('/products/:id', updateProduct);

export default router;