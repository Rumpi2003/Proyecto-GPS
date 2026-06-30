import { type Request, type Response } from 'express';
import { ComentarioService } from '../services/comentario.service.js';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
import { createComentarioSchema } from '../validations/comentario.validation.js';

const comentarioService = new ComentarioService();

export async function crearComentario(req: Request, res: Response): Promise<void> {
  try {
    const id_usuario = req.user?.id;
    if (!id_usuario) {
      sendError(res, 'Usuario no autenticado', 401);
      return;
    }

    // Validación in-controller
    const { error, value } = createComentarioSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d) => d.message).join(', '), 400);
      return;
    }

    const comentarioCreado = await comentarioService.crear(id_usuario, value);
    sendSuccess(res, comentarioCreado, 'Comentario publicado correctamente', 201);
    
  } catch (error: any) {
    const message = error.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;
    else if (message.includes('BAD_REQUEST:')) statusCode = 400;

    // Limpiamos el mensaje para el frontend
    const cleanMessage = message.replace(/NOT_FOUND:|BAD_REQUEST:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}

export async function listarPorPublicacion(req: Request, res: Response): Promise<void> {
  try {
    const id_publicacion = Number(req.params.id_publicacion);
    if (isNaN(id_publicacion)) {
      sendError(res, 'ID de publicación inválido', 400);
      return;
    }

    const comentarios = await comentarioService.obtenerPorPublicacion(id_publicacion);
    sendSuccess(res, comentarios, 'Comentarios obtenidos correctamente');
    
  } catch (error: any) {
    const message = error.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;

    const cleanMessage = message.replace(/NOT_FOUND:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}