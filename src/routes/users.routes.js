import { Router } from 'express';
import { getUsers, 
        getUser,
        getUserByName, 
        createUser, 
        deleteUser, 
        updateUser,
        login 
                } from '../controllers/users.controller.js';


const router = Router();

// Login
router.post('/users/login', login);

// Register (alias of createUser, clearer for the frontend)
router.post('/users/register', createUser);

// Get all users
router.get('/users', getUsers);

// Get a user by ID
router.get('/users/:id', getUser);

// Find a user by name
router.get('/users/search/:name', getUserByName);

// Create a new user
router.post('/users', createUser);

// Delete a user
router.delete('/users/:id', deleteUser);

// Update an existing user
router.put('/users/:id', updateUser);

export default router;