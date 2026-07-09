import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuario.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esAdmin } from '../middleware/esAdmin.js';


const router = Router();

router.get('/', authenticate, esAdmin, obtenerUsuarios);
router.get('/:id', authenticate, esAdmin, obtenerUsuario);
router.post('/', authenticate, esAdmin, crearUsuario);
router.put('/:id', authenticate, esAdmin, actualizarUsuario);
router.delete('/:id', authenticate, esAdmin, eliminarUsuario);

export default router;