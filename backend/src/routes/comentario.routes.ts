import { Router } from 'express';
import { crearComentario, listarPorPublicacion } from '../controllers/comentario.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint público: Cualquiera puede ver los comentarios de un arriendo
router.get('/publicacion/:id_publicacion', listarPorPublicacion);

// Endpoint protegido: Solo usuarios registrados (con token) pueden comentar
router.post('/', authenticate, crearComentario);

export default router;