import { Router } from 'express';
import { 
    getCategories, 
    getCategory, 
    getCategoryByName,
    createCategory,
    deleteCategory,
    updateCategory 
} from '../controllers/categories.controller.js';

const router = Router();

// Obtener todas las categorías
router.get('/categories', getCategories);

// Obtener una categoría por su ID único
router.get('/categories/:id', getCategory);

// Buscar una categoría por su nombre exacto
router.get('/categories/search/:name', getCategoryByName);

// Crear una nueva categoría
router.post('/categories', createCategory);

// Eliminar una categoría
router.delete('/categories/:id', deleteCategory);

// Actualizar una categoría
router.put('/categories/:id', updateCategory);

export default router;