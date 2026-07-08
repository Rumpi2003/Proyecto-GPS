import { Router } from 'express';
import { crearReportePubli, evaluarReportePubli } from '../controllers/reportePubli.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esAdmin } from '../middleware/esAdmin.js';

const router = Router();

router.post('/', authenticate, crearReportePubli);
router.patch('/:id_reporte/evaluar', authenticate, esAdmin, evaluarReportePubli);

export default router;