import { Router, type Application, type Request, type Response } from 'express';
//imports de usuario y autenticacion
import usuarioRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';
import publicacionRoutes from './publicacion.routes.js';
import comentarioRoutes from './comentario.routes.js';
import reportePubliRoutes from './reportePubli.routes.js';
import reporteComRoutes from './reporteCom.routes.js';
import valoracionRoutes from './valoracion.routes.js';
import universidadRoutes from './universidad.routes.js';
import etiquetaRoutes from './etiqueta.routes.js';

export default function routerApi(app: Application) {
    const router = Router();

    app.use('/api', router);
    // Rutas de usuario y autenticación
    router.use('/usuarios', usuarioRoutes);
    router.use('/auth', authRoutes);
    router.use('/publicaciones', publicacionRoutes);
    router.use('/comentarios', comentarioRoutes);
    router.use('/reportes-publicaciones', reportePubliRoutes);
router.use('/reportes-comentarios', reporteComRoutes);
    router.use('/valoraciones', valoracionRoutes);
    router.use('/universidades', universidadRoutes);
    router.use('/etiquetas', etiquetaRoutes);
}