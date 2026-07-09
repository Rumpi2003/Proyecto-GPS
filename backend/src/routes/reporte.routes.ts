import { Router } from 'express';
import { crearReporte, evaluarReporte, listarReportesPendientes } from '../controllers/reporte.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, crearReporte);
router.get('/pendientes', authenticate, listarReportesPendientes);
router.patch('/:id_reporte/evaluar', authenticate, evaluarReporte);

export default router;