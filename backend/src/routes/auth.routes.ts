import { Router } from 'express';
import { registrarUsuario, iniciarSesion } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);

export default router;