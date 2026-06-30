import { Router, type Application, type Request, type Response } from 'express';
//imports de usuario y autenticacion
import usuarioRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';
import publicacionRoutes from './publicacion.routes.js';
import comentarioRoutes from './comentario.routes.js';
import reporteRoutes from './reporte.routes.js';
import valoracionRoutes from './valoracion.routes.js';

export default function routerApi(app: Application) {
    const router = Router();

    app.use('/api', router);
    // Rutas de usuario y autenticación
    router.use('/usuarios', usuarioRoutes);
    router.use('/auth', authRoutes);
    router.use('/publicaciones', publicacionRoutes);
    router.use('/comentarios', comentarioRoutes);
    router.use('/reportes', reporteRoutes);
    router.use('/valoraciones', valoracionRoutes);
}