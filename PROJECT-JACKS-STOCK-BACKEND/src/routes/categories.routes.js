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

// Get all categories
router.get('/categories', getCategories);

// Get a category by its unique ID
router.get('/categories/:id', getCategory);

// Find a category by exact name
router.get('/categories/search/:name', getCategoryByName);

// Create a new category
router.post('/categories', createCategory);

// Delete a category
router.delete('/categories/:id', deleteCategory);

// Update a category
router.put('/categories/:id', updateCategory);

export default router;