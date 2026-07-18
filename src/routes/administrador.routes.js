import { Router } from 'express';
import { getAdministradores, 
        getAdministrador, 
        createAdministrador, 
        deleteAdministrador, 
        updateAdministrador } from '../controllers/administrador.controller.js';


const router = Router();

router.get('/administrador', getAdministradores);

router.get('/administrador/:id', getAdministrador);

router.post('/administrador', createAdministrador);

router.delete('/administrador/:id', deleteAdministrador);

router.put('/administrador/:id', updateAdministrador);

export default router;