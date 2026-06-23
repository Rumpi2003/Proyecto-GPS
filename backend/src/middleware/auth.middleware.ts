import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definida');
  return secret;
};

const JWT_SECRET = getJwtSecret();

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; rol: string };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Token no proporcionado' });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; rol: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
  }
}