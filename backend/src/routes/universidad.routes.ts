import { Router } from 'express';
import { obtenerUniversidades, obtenerUniversidad } from '../controllers/universidad.controller.js';

const router = Router();

router.get('/', obtenerUniversidades);
router.get('/:id_universidad', obtenerUniversidad);

export default router;