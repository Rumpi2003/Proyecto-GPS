import { Router } from 'express';
import { 
    crearPublicacion,
    actualizarPublicacion,
    eliminarPublicacion,
    toggleEstadoPublicacion,
    obtenerPublicacionesPorFiltros,
    obtenerPublicacionesUsuario,
    obtenerPublicacionesActivasUsuario,
    obtenerPublicacionesInactivasUsuario,
 } from '../controllers/publicacion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esRegistradoPublicante } from '../middleware/esRegistradoPublicante.js';
import { esDueñoPublicacion } from '../middleware/esDueñoPublicación.middleware.js';
import { uploadPublicacion } from '../middleware/uploadImagen.middleware.js';

const router = Router();

router.post('/', authenticate, esRegistradoPublicante, uploadPublicacion, crearPublicacion);
router.put('/:id_publicacion', authenticate, esDueñoPublicacion, uploadPublicacion, actualizarPublicacion);
router.patch('/:id_publicacion/estado', authenticate, esDueñoPublicacion, toggleEstadoPublicacion);
router.delete('/:id_publicacion', authenticate, esDueñoPublicacion, eliminarPublicacion);
router.get('/filtros', obtenerPublicacionesPorFiltros);
router.get('/usuario/:id_usuario', authenticate, esRegistradoPublicante, obtenerPublicacionesUsuario);
router.get('/usuario/:id_usuario/activas', authenticate, esRegistradoPublicante, obtenerPublicacionesActivasUsuario);
router.get('/usuario/:id_usuario/inactivas', authenticate, esRegistradoPublicante, obtenerPublicacionesInactivasUsuario);

export default router;
