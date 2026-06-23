import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida en las variables de entorno');
}

export function encriptarContraseña(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function compararContraseña(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generarToken(payload: { id: number; rol: string }): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '24h' });
}