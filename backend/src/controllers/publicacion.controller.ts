import { type Request, type Response } from "express";
import { sendSuccess, sendError } from "../handlers/responseHandlers.js";
import { PublicacionService } from "../services/publicacion.service.js";
import { distanciaMinima } from "../middleware/distanciaMinima.middleware.js";
import { direccionExiste } from "../middleware/direccionExistente.middleware.js";
import { Usuario } from "../entities/usuario.entity.js";

const publicacionService = new PublicacionService();

export async function crearPublicacion(req: Request, res: Response): Promise<void> {
    try {
        const { calle, numero, comuna, titulo, descripcion, precio, telefono} = req.body;

        if (!calle || numero == null || !comuna) {
            sendError(res, 'Faltan campos de dirección (calle, numero, comuna', 400);
            return;
        }

        const numeroParsed = Number(numero);
        if (Number.isNaN(numeroParsed)) {
            sendError(res, 'Número de dirección inválido', 400);
            return;
        }

        // Validar que la dirección no exista
        const existe = await direccionExiste(comuna, calle, numeroParsed);
        if (existe) {
            sendError(res, 'Ya existe una publicación con esa dirección', 400);
            return;
        }

        // Validar que este dentro del rango de 3000m de una universidad
        const direccion = `${calle} ${numeroParsed}, ${comuna}, Bio Bio, Chile`;
        const universidades = await distanciaMinima(direccion);

        if (!universidades || universidades.length === 0) {
            sendError(res, 'la publicación debe estar a máximo 3000 metros de una universidad', 400);
            return;
        }

        const publicante = new Usuario();
        publicante.id_usuario = req.user!.id;

        // Crear la publicación
        const nueva = await publicacionService.create({
            titulo,
            descripcion,
            precio: precio != null ? Number(precio) : 0,
            telefono,
            comuna,
            calle,
            numero: numeroParsed,
            publicante,
        });

        // Crear las cercanías
        for (const item of universidades) {
            await publicacionService.createCercania(
                nueva.id_publicacion,
                item.universidad.id_universidad,
                Math.round(item.distancia_metros),
            );
        }
        
        sendSuccess(res, { publicacion: nueva, universidades }, 'publicacion creada', 201);
    } catch (err) {
        sendError(res, 'Error al crear publicación', 500);
    }
}