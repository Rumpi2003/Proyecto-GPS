import { type Request, type Response, type NextFunction } from 'express';

export function esAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.rol !== 'administrador') {
    res.status(403).json({ status: 'error', message: 'Se requiere rol de administrador' });
    return;
  }
  next();
}