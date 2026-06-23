import { Router } from 'express';
import { registrarUsuario, iniciarSesion, crearAdminInicial } from '../controllers/auth.controller.js';

const router = Router();

router.post('/auth/register', registrarUsuario);
router.post('/auth/login', iniciarSesion);
//admin inicial
router.post('/auth/setup-admin', crearAdminInicial);

export default router;