import { type Request, type Response } from 'express';
import { ReporteService } from '../services/reporte.service.js';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
import { createReporteSchema, evaluarReporteSchema } from '../validations/reporte.validation.js';

const reporteService = new ReporteService();

export async function crearReporte(req: Request, res: Response): Promise<void> {
  try {
    const id_usuario = req.user?.id;
    if (!id_usuario) {
      sendError(res, 'Usuario no autenticado', 401);
      return;
    }

    // Validación in-controller (Estándar de tu equipo)
    const { error, value } = createReporteSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d: any) => d.message).join(', '), 400);
      return;
    }

    const reporteCreado = await reporteService.crear(id_usuario, value);
    sendSuccess(res, reporteCreado, 'Reporte creado correctamente', 201);
    
  } catch (error: any) {
    const message = error.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;
    else if (message.includes('BAD_REQUEST:')) statusCode = 400;

    const cleanMessage = message.replace(/NOT_FOUND:|BAD_REQUEST:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}

export async function evaluarReporte(req: Request, res: Response): Promise<void> {
  try {
    const id_reporte = Number(req.params.id_reporte);
    if (isNaN(id_reporte)) {
      sendError(res, 'ID de reporte inválido', 400);
      return;
    }

    const { error, value } = evaluarReporteSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d: any) => d.message).join(', '), 400);
      return;
    }

    const reporteEvaluado = await reporteService.evaluar(id_reporte, value.estado);
    sendSuccess(res, reporteEvaluado, 'Reporte evaluado correctamente', 200);

  } catch (error: any) {
    const message = error.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;

    const cleanMessage = message.replace(/NOT_FOUND:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}

export async function listarReportesPendientes(req: Request, res: Response): Promise<void> {
  try {
    const reportes = await reporteService.obtenerPendientes();
    sendSuccess(res, reportes, 'Reportes pendientes obtenidos correctamente');
  } catch (error: any) {
    sendError(res, 'Error al obtener los reportes pendientes', 500);
  }
}