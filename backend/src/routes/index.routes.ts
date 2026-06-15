import { Router, type Application, type Request, type Response } from 'express';

export default function routerApi(app: Application) {
    const router = Router();

    router.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API funcionando' });
    });

    router.get('/status', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API funcionando desde router' });
    });

    app.use('/api', router);
}