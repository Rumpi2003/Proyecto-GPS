import { Router, type Application, type Request, type Response } from 'express';
import { geocodingService } from '../services/geocoding.service.js';

export default function routerApi(app: Application) {
    const router = Router();

    router.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API funcionando' });
    });

    router.get('/status', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API funcionando desde router' });
    });

    router.get('/geocoding', async(req: Request, res: Response) => {
        const direccion = String(req.query.direccion || '').trim();

        if (!direccion) {
            return res.status(400).json({ error: 'Falta el parámetro direccion'});
        }

        try {
            const resultado = await geocodingService.geocodeAddress(direccion);
            return res.json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    });

    app.use('/api', router);
}