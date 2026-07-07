import { Router } from 'express';
import { 
    crearPublicacion,
    actualizarPublicacion,
    eliminarPublicacion,
    obtenerPublicacionesPorFiltros,
    obtenerPublicacionesUsuario,
    obtenerPublicacionesActivasUsuario,
    obtenerPublicacionesInactivasUsuario,
    obtenerPublicacionPorId
 } from '../controllers/publicacion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esRegistradoPublicante } from '../middleware/esRegistradoPublicante.js';
import { esDueñoPublicacion } from '../middleware/esDueñoPublicación.middleware.js';

const router = Router();

router.post('/', authenticate, esRegistradoPublicante, crearPublicacion);
router.put('/:id_publicacion', authenticate, esDueñoPublicacion, actualizarPublicacion);
router.delete('/:id_publicacion', authenticate, esDueñoPublicacion, eliminarPublicacion);
router.get('/filtros', obtenerPublicacionesPorFiltros);
router.get('/usuario/:id_usuario', authenticate, esRegistradoPublicante, obtenerPublicacionesUsuario);
router.get('/usuario/:id_usuario/activas', authenticate, esRegistradoPublicante, obtenerPublicacionesActivasUsuario);
router.get('/usuario/:id_usuario/inactivas', authenticate, esRegistradoPublicante, obtenerPublicacionesInactivasUsuario);
router.get('/:id_publicacion', obtenerPublicacionPorId);
export default router;