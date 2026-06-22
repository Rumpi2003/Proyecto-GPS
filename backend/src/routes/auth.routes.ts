import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
//admin inicial
import { setupAdmin } from '../controllers/auth.controller.js';
router.post('/auth/setup-admin', setupAdmin);

export default router;