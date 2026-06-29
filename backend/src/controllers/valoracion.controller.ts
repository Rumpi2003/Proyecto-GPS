import { type Request, type Response } from 'express';
import { ValoracionService } from '../services/valoracion.service.js';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
import { createValoracionSchema } from '../validations/valoracion.validation.js';

const valoracionService = new ValoracionService();

export async function crearValoracion(req: Request, res: Response): Promise<void> {
  try {
    const id_usuario = req.user?.id;
    
    if (!id_usuario) {
      sendError(res, 'Usuario no autenticado', 401);
      return;
    }

    // Validación in-controller
    const { error, value } = createValoracionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d) => d.message).join(', '), 400);
      return;
    }

    const nuevaValoracion = await valoracionService.crear(id_usuario, value);
    sendSuccess(res, nuevaValoracion, 'Valoración registrada y promedio actualizado correctamente', 201);
    
  } catch (error: any) {
    const message = error.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;
    else if (message.includes('BAD_REQUEST:')) statusCode = 400;

    const cleanMessage = message.replace(/NOT_FOUND:|BAD_REQUEST:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}