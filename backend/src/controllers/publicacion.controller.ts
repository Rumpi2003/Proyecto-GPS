import { type Request, type Response } from "express";
import { sendSuccess, sendError } from "../handlers/responseHandlers.js";
import { PublicacionService } from "../services/publicacion.service.js";
import { distanciaMinima } from "../middleware/distanciaMinima.middleware.js";
import { direccionExiste } from "../middleware/direccionExistente.middleware.js";
import { Usuario } from "../entities/usuario.entity.js";
import { EtiquetaService } from "../services/etiqueta.service.js";
import { type Publicacion } from "../entities/publicacion.entity.js";
import {
    createPublicacionSchema,
    updatePublicacionSchema,
    idPublicacionParamSchema,
    idUsuarioParamSchema,
    filtrosPublicacionSchema,
} from '../validations/publicacion.validation.js';

const publicacionService = new PublicacionService();
const etiquetaService = new EtiquetaService();

export async function crearPublicacion(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = createPublicacionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message).join(', '), 400);
            return;
        }

        const { place_id, titulo, descripcion, precio, telefono, permitir_comentarios, url_fotos = [], url_portada, etiquetas = [] } = value;

        // Validar que este dentro del rango de 3000m de una universidad
        const resultados = await distanciaMinima(place_id);

        if (!resultados || resultados.length === 0) {
            sendError(res, 'la publicación debe estar a máximo 3000 metros de una universidad', 400);
            return;
        }

        const direccion = resultados[0]?.direccion

        if (!direccion) {
            sendError(res, 'No se pudo obtener la dirección', 500);
            return;
        }

        const existe = await direccionExiste(direccion);

        if (existe) {
            sendError(res, 'Ya existe una publicación con esa dirección', 400);
            return;
        }

        const coordenadas = resultados[0]?.coordenadas;

        if (!coordenadas) {
            sendError(res, 'No se pudieron obtener las coordenadas de la dirección', 500);
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
            direccion,
            publicante,
            coordenadas,
            permitir_comentarios,
        });

        // Añade las Fotos
        for (const fotoUrl of url_fotos) {
            if (typeof fotoUrl === 'string' && fotoUrl.trim()) {
                await publicacionService.addFoto(nueva.id_publicacion, fotoUrl, false);
            }
        }
        
        // Añade la Portada
        await publicacionService.addFoto(nueva.id_publicacion, url_portada, true);

        // Añade las Etiquetas
        for (const idEtiqueta of etiquetas) {
            if (typeof idEtiqueta === 'number') {
                await etiquetaService.addEtiqueta(nueva.id_publicacion, idEtiqueta);
            }
        }

        // Crear las cercanías
        for (const item of resultados) {
            await publicacionService.createCercania(
                nueva.id_publicacion,
                item.universidad.id_universidad,
                Math.round(item.distancia_metros),
            );
        }
        
        sendSuccess(res, { publicacion: nueva, resultados }, 'publicacion creada', 201);
    } catch (err) {
        sendError(res, 'Error al crear publicación', 500);
    }
}

export async function actualizarPublicacion(req: Request, res: Response): Promise<void> {
    try {
        const { error: paramsError, value: paramsValue } =idPublicacionParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        const { error: bodyError, value: bodyValue } = updatePublicacionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (paramsError) {
            sendError(res, paramsError.details.map((d) => d.message).join(', '), 400);
            return;
        }

        if (bodyError) {
            sendError(res, bodyError.details.map((d) => d.message).join(', '), 400);
            return;
        }

        const { id_publicacion } = paramsValue;

        const {
            titulo,
            descripcion,
            precio,
            telefono,
            permitir_comentarios,
            estado,
            eliminar_fotos = [],
            nuevas_fotos = [],
            eliminar_etiquetas = [],
            nuevas_etiquetas = [],
        } = bodyValue;

        const id = Number(id_publicacion);

        if (Number.isNaN(id)) {
            sendError(res, 'id_publicación inválido', 400);
            return;
        }

        const publicacion = await publicacionService.findOne(id);

        if (!publicacion) {
            sendError(res, 'Publicación no encontrada', 404);
            return;
        }

        const datosActualizados: Partial<Publicacion> = {};

        if (titulo !== undefined) datosActualizados.titulo = titulo;
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
        if (precio !== undefined) datosActualizados.precio = Number(precio);
        if (telefono !== undefined) datosActualizados.telefono = telefono;
        if (permitir_comentarios !== undefined) datosActualizados.permitir_comentarios = permitir_comentarios;
        if (estado !== undefined) datosActualizados.estado = estado;
        
        // Actualizar la publicación solo si hay cambios
        if(Object.keys(datosActualizados).length > 0) {
            await publicacionService.update(id, datosActualizados);
        }

        // Eliminar fotos
        for (const idFoto of eliminar_fotos) {
            if (typeof idFoto === 'number') {
                await publicacionService.removeFoto(idFoto);
            }
        }

        // Añadir nuevas fotos
        for (const fotoUrl of nuevas_fotos) {
            if (typeof fotoUrl === 'string' && fotoUrl.trim()) {
                await publicacionService.addFoto(id, fotoUrl, false);
            }
        }

        // Eliminar etiquetas
        for (const idEtiqueta of eliminar_etiquetas) {
            if (typeof idEtiqueta === 'number') {
                await etiquetaService.removeEtiqueta(id, idEtiqueta);
            }
        }

        // Añadir nuevas etiquetas
        for (const idEtiqueta of nuevas_etiquetas) {
            if (typeof idEtiqueta === 'number') {
                await etiquetaService.addEtiqueta(id, idEtiqueta);
            }
        }

        const publicacionActualizada = await publicacionService.findOne(id);

        sendSuccess(res, publicacionActualizada, 'Publicación actualizada', 200);
    } catch (err) {
        sendError(res, 'Error al actualizar publicación', 500);
    }
}

export async function eliminarPublicacion(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = idPublicacionParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message).join(', '), 400);
            return;
        }
        const id = Number(value.id_publicacion);

        if(Number.isNaN(id)) {
            sendError(res, 'id_publicación inválido', 400);
            return;
        }

        await publicacionService.delete(id);
        sendSuccess(res, null, 'Publicación eliminada', 200);
    } catch (err) {
        sendError(res, 'Error al eliminar publicación', 500);
    }
}

export async function obtenerPublicacionesPorFiltros(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = filtrosPublicacionSchema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message).join(', '), 400);
            return;
        }

        const {
            id_universidad,
            distancia_max,
            precio_max,
            valoracion_min,
            ids_etiquetas,
        } = value;

        if (!id_universidad) {
            sendError(res, 'id_universidad es requerido', 400);
            return;
        }

        const filtros: {
            id_universidad: number;
            distancia_max?: number;
            precio_max?: number;
            valoracion_min?: number;
            ids_etiquetas?: number[];
            } = {
            id_universidad: Number(id_universidad),
            };

            if (distancia_max !== undefined) {
            filtros.distancia_max = Number(distancia_max);
            }

            if (precio_max !== undefined) {
            filtros.precio_max = Number(precio_max);
            }

            if (valoracion_min !== undefined) {
            filtros.valoracion_min = Number(valoracion_min);
            }

            if (typeof ids_etiquetas === 'string' && ids_etiquetas.trim().length > 0) {
            filtros.ids_etiquetas = ids_etiquetas
                .split(',')
                .map((id) => Number(id.trim()))
                .filter((n) => !Number.isNaN(n));
        }

        if (Number.isNaN(filtros.id_universidad)) {
            sendError(res, 'id_universidad inválido', 400);
            return;
        }

        const publicaciones = await publicacionService.findByFiltros(filtros);
        sendSuccess(res, publicaciones, 'Publicaciones obtenidas', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicaciones por filtros', 500);
    }
}

export async function obtenerPublicacionesUsuario(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = idUsuarioParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message).join(', '), 400);
            return;
        }

        const id_usuario = Number(value.id_usuario);

        const publicaciones = await publicacionService.findByPublicante(id_usuario);
        sendSuccess(res, publicaciones, 'Publicaciones del usuario obtenidas', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicaciones del usuario', 500);
    }
}

export async function obtenerPublicacionesActivasUsuario(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = idUsuarioParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message).join(', '), 400);
            return;
        }

        const id_usuario = Number(value.id_usuario);

        const publicaciones = await publicacionService.findByPublicanteActivas(id_usuario);
        sendSuccess(res, publicaciones, 'Publicaciones activas del usuario obtenidas', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicaciones activas del usuario', 500);
    }
}

export async function obtenerPublicacionesInactivasUsuario(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = idUsuarioParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message).join(', '), 400);
            return;
        }

        const id_usuario = Number(value.id_usuario);

        const publicaciones = await publicacionService.findByPublicanteInactivas(id_usuario);
        sendSuccess(res, publicaciones, 'Publicaciones inactivas del usuario obtenidas', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicaciones inactivas del usuario', 500);
    }
}