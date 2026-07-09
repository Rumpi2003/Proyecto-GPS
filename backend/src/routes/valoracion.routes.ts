import { Router } from 'express';
import { crearValoracion } from '../controllers/valoracion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint protegido: Solo usuarios registrados pueden valorar
router.post('/', authenticate, crearValoracion);

export default router;