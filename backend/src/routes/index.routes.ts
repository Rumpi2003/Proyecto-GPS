import { Router, type Application, type Request, type Response } from 'express';
//imports de usuario y autenticacion
import usuarioRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';

export default function routerApi(app: Application) {
    const router = Router();

    router.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API funcionando' });
    });

    router.get('/status', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API funcionando desde router' });
    });

    app.use('/api', router);
    // Rutas de usuario y autenticación
    app.use('/api', usuarioRoutes)
    app.use('/api', authRoutes);
}