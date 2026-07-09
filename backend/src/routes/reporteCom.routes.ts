import { Router } from 'express';
import { crearReporteCom, evaluarReporteCom, obtenerMisReportesCom, obtenerReportesCom } from '../controllers/reporteCom.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esAdmin } from '../middleware/esAdmin.middleware.js';

const router = Router();

router.get('/', authenticate, esAdmin, obtenerReportesCom);
router.get('/mis-reportes', authenticate, obtenerMisReportesCom);
router.post('/', authenticate, crearReporteCom);
router.patch('/:id_reporte_com/evaluar', authenticate, esAdmin, evaluarReporteCom);

export default router;