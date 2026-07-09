import { type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
import { UniversidadService } from '../services/universidad.service.js';

const universidadService = new UniversidadService();

export async function obtenerUniversidades(req: Request, res: Response): Promise<void> {
    try {
        const universidades = await universidadService.findAll();
        sendSuccess(res, universidades, 'Universidades obtenidas correctamente');
    } catch (error) {
        sendError(res, 'Error al obtener universidades');
    }
}

export async function obtenerUniversidad(req: Request, res: Response): Promise<void> {
    try {
        const id_universidad = Number(req.params.id_universidad);

        if (Number.isNaN(id_universidad)) {
            sendError(res, 'ID de universidad inválido', 400);
            return;
        }

        const universidad = await universidadService.findOne(id_universidad);

        if (!universidad) {
            sendError(res, 'Universidad no encontrada', 404);
            return;
        }

        sendSuccess(res, universidad, 'Universidad obtenida correctamente');
    } catch (error) {
        sendError(res, 'Error al obtener universidad');
    }
}