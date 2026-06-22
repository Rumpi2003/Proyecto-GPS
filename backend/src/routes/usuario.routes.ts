import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from '../controllers/usuario.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esAdmin } from '../middleware/esAdmin.js';


const router = Router();

router.get('/usuarios', authenticate, esAdmin, getAll);
router.get('/usuarios/:id', authenticate, esAdmin, getById);
router.post('/usuarios', authenticate, esAdmin, create);
router.put('/usuarios/:id', authenticate, esAdmin, update);
router.delete('/usuarios/:id', authenticate, esAdmin, remove);

export default router;