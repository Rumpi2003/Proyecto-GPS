import { Router } from 'express';
import { obtenerEtiquetas } from '../controllers/etiqueta.controller.js';

const router = Router();

router.get('/', obtenerEtiquetas);

export default router;