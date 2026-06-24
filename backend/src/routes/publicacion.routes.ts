import { Router } from 'express';
import { crearPublicacion } from '../controllers/publicacion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esRegistradoPublicante } from '../middleware/esRegistradoPublicante.js';

const router = Router();

router.post('/publicaciones', authenticate, esRegistradoPublicante, crearPublicacion);

export default router;