import { Router } from 'express';
import { crearReportePubli, evaluarReportePubli, obtenerReportesPubli } from '../controllers/reportePubli.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esAdmin } from '../middleware/esAdmin.middleware.js';

const router = Router();

router.get('/', authenticate, esAdmin, obtenerReportesPubli);
router.post('/', authenticate, crearReportePubli);
router.patch('/:id_reporte/evaluar', authenticate, esAdmin, evaluarReportePubli);

export default router;