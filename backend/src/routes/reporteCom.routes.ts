import { Router } from 'express';
import { crearReporteCom, evaluarReporteCom } from '../controllers/reporteCom.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esAdmin } from '../middleware/esAdmin.js';

const router = Router();

router.post('/', authenticate, crearReporteCom);
router.patch('/:id_reporte_com/evaluar', authenticate, esAdmin, evaluarReporteCom);

export default router;