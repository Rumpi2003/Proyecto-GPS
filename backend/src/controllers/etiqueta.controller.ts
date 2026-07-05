import { type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
import { EtiquetaService } from '../services/etiqueta.service.js';

const etiquetaService = new EtiquetaService();

export async function obtenerEtiquetas(req: Request, res: Response): Promise<void> {
    try {
        const etiquetas = await etiquetaService.findAllEtiquetasConCategoria();
        sendSuccess(res, etiquetas, 'Etiquetas obtenidas correctamente');
    } catch (error) {
        sendError(res, 'Error al obtener etiquetas');
    }
}