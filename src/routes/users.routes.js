import { Router } from 'express';
import { getUsers, 
        getUser,
        getUserByName, 
        createUser, 
        deleteUser, 
        updateUser } from '../controllers/users.controller.js';


const router = Router();

// Obtener todos los usuarios
router.get('/users', getUsers);

// Obtener un usuario por ID
router.get('/users/:id', getUser);

// Buscar un usuario por su nombre
router.get('/users/search/:name', getUserByName);

// Crear un nuevo usuario
router.post('/users', createUser);

// Eliminar un usuario
router.delete('/users/:id', deleteUser);

// Actualizar un usuario existente
router.put('/users/:id', updateUser);

export default router;