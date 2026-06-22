import { type Response } from 'express';

export function sendSuccess(
  res: Response,
  data?: unknown,
  message = 'Operación exitosa',
  statusCode = 200,
): void {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message = 'Error interno del servidor',
  statusCode = 500,
): void {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
}