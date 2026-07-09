import { Router } from 'express';
import { 
    crearPublicacion,
    obtenerPublicacion,
    actualizarPublicacion,
    eliminarPublicacion,
    toggleEstadoPublicacion,
    obtenerPublicacionesPorFiltros,
    obtenerPublicacionesUsuario,
    obtenerPublicacionesActivasUsuario,
    obtenerPublicacionesInactivasUsuario,
    obtenerPublicacionesPendientes,
    actualizarEstadoPublicacion,
    obtenerPublicacionPorId
 } from '../controllers/publicacion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { esRegistradoPublicante } from '../middleware/esRegistradoPublicante.js';
import { esDueñoPublicacion } from '../middleware/esDueñoPublicación.middleware.js';
import { esAdmin } from '../middleware/esAdmin.middleware.js';
import { uploadPublicacion, uploadPublicacionUpdate } from '../middleware/uploadImagen.middleware.js';

const router = Router();

router.post('/', authenticate, esRegistradoPublicante, uploadPublicacion, crearPublicacion);
router.put('/:id_publicacion', authenticate, esDueñoPublicacion, uploadPublicacionUpdate, actualizarPublicacion);
router.patch('/:id_publicacion/estado', authenticate, toggleEstadoPublicacion);
router.delete('/:id_publicacion', authenticate, esDueñoPublicacion, eliminarPublicacion);
router.get('/filtros', obtenerPublicacionesPorFiltros);
router.get('/pendientes', authenticate, esAdmin, obtenerPublicacionesPendientes);
router.patch('/:id_publicacion/revision', authenticate, esAdmin, actualizarEstadoPublicacion);
router.get('/usuario/:id_usuario', authenticate, esRegistradoPublicante, obtenerPublicacionesUsuario);
router.get('/usuario/:id_usuario/activas', authenticate, esRegistradoPublicante, obtenerPublicacionesActivasUsuario);
router.get('/usuario/:id_usuario/inactivas', authenticate, esRegistradoPublicante, obtenerPublicacionesInactivasUsuario);
router.get('/:id_publicacion', obtenerPublicacionPorId);
export default router;
