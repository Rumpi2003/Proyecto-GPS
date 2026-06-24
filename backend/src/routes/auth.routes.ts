import { Router } from 'express';
import { registrarUsuario, iniciarSesion, crearAdminInicial } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
//admin inicial
router.post('/setup-admin', crearAdminInicial);

export default router;