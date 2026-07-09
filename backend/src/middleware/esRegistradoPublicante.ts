import { type Request ,type Response, type NextFunction } from "express";

export function esRegistradoPublicante(req: Request, res: Response, next: NextFunction): void {
    if(req.user?.rol !== 'registrado' && req.user?.rol !== 'publicante') {
        res.status(403).json({ status: 'error', message: 'Se requiere rol de usuario registrado o publicante' });
        return;
    }
    next();
}