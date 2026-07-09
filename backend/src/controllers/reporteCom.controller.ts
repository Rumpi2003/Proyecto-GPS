import { type Request, type Response } from 'express';
import { createReporteComSchema, evaluarReporteComSchema } from '../validations/reporteCom.validation.js';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
import { ReporteComService } from '../services/reporteCom.service.js';

const reporteComService = new ReporteComService();

export async function obtenerReportesCom(req: Request, res: Response): Promise<void> {
  try {
    const reportes = await reporteComService.listarPendientes();
    sendSuccess(res, reportes, 'Reportes de comentarios obtenidos', 200);
  } catch (error: any) {
    sendError(res, 'Error al obtener los reportes de comentarios', 500);
  }
}

export async function crearReporteCom(req: Request, res: Response): Promise<void> {
  try {
    const { error } = createReporteComSchema.validate(req.body, { abortEarly: false });
    if (error) {
      // Usamos ?. para evitar que TS reclame si details no existe
      const mensajeError = error?.details?.map((d: any) => d?.message).join(', ') || 'Datos inválidos';
      sendError(res, mensajeError, 400);
      return;
    }

    const id_usuario = req.user?.id;
    if (!id_usuario) {
      sendError(res, 'Usuario no autenticado', 401);
      return;
    }

    const userAgent = req.headers['user-agent'] || 'Desconocido';
    const ipReporte = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '0.0.0.0';

    const reporteCreado = await reporteComService.crear(id_usuario, {
      id_comentario: req.body.id_comentario,
      motivo: req.body.motivo,
      detalle: req.body.detalle,
      ip_reporte: ipReporte,
      user_agent: userAgent,
    });

    sendSuccess(res, reporteCreado, 'Reporte de comentario creado correctamente', 201);
    
  } catch (error: any) {
    const message = error?.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;
    else if (message.includes('BAD_REQUEST:')) statusCode = 400;
    else if (message.includes('FORBIDDEN:')) statusCode = 403;

    const cleanMessage = message.replace(/NOT_FOUND:|BAD_REQUEST:|FORBIDDEN:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}

export async function evaluarReporteCom(req: Request, res: Response): Promise<void> {
  try {
    const id_reporte_com = Number(req.params.id_reporte_com);
    if (isNaN(id_reporte_com)) {
      sendError(res, 'ID de reporte inválido', 400);
      return;
    }

    const { error } = evaluarReporteComSchema.validate(req.body);
    if (error) {
      // Blindado con Optional Chaining
      const mensajeError = error?.details?.[0]?.message || 'Estado inválido';
      sendError(res, mensajeError, 400);
      return;
    }

    const reporteEvaluado = await reporteComService.evaluar(id_reporte_com, req.body.estado);
    sendSuccess(res, reporteEvaluado, 'Reporte evaluado correctamente', 200);

  } catch (error: any) {
    const message = error?.message || 'Error interno del servidor';
    let statusCode = 500;

    if (message.includes('NOT_FOUND:')) statusCode = 404;

    const cleanMessage = message.replace(/NOT_FOUND:/g, '').trim();
    sendError(res, cleanMessage, statusCode);
  }
}