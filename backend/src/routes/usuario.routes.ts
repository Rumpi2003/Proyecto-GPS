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

router.get('/usuarios', authenticate, esAdmin, obtenerUsuarios);
router.get('/usuarios/:id', authenticate, esAdmin, obtenerUsuario);
router.post('/usuarios', authenticate, esAdmin, crearUsuario);
router.put('/usuarios/:id', authenticate, esAdmin, actualizarUsuario);
router.delete('/usuarios/:id', authenticate, esAdmin, eliminarUsuario);

export default router;