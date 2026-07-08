import { type Request, type Response } from "express";
import { sendSuccess, sendError } from "../handlers/responseHandlers.js";
import { PublicacionService } from "../services/publicacion.service.js";
import { distanciaMinima } from "../middleware/distanciaMinima.middleware.js";
import { direccionExiste } from "../middleware/direccionExistente.middleware.js";
import { Usuario, Rol } from "../entities/usuario.entity.js";
import { EtiquetaService } from "../services/etiqueta.service.js";
import { Estado, type Publicacion } from "../entities/publicacion.entity.js";
import { generarToken } from "../services/auth.service.js";
import { actualizar, obtenerPorId } from "../services/usuario.service.js";
import { eliminarArchivosSubidos } from '../middleware/uploadImagen.middleware.js';
import {
    createPublicacionSchema,
    updatePublicacionSchema,
    idPublicacionParamSchema,
    idUsuarioParamSchema,
    filtrosPublicacionSchema,
    toggleEstadoSchema,
} from '../validations/publicacion.validation.js';

const publicacionService = new PublicacionService();
const etiquetaService = new EtiquetaService();

/** Convierte JSON strings de multipart a valores reales */
function parseMultipartBody(body: Record<string, unknown>) {
    const camposJson = ['etiquetas', 'eliminar_fotos', 'eliminar_etiquetas', 'nuevas_etiquetas'];

    for (const campo of camposJson) {
        if (typeof body[campo] === 'string') {
            try {
                body[campo] = JSON.parse(body[campo] as string);
            } catch {
                // Si no es JSON válido, lo dejamos como viene
            }
        }
    }

    // Booleans vienen como string en multipart
    if (typeof body.permitir_comentarios === 'string') {
        body.permitir_comentarios = body.permitir_comentarios === 'true';
    }
}

function getFiles(req: Request) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    return {
        portada: files?.['portada']?.[0],
        fotos: files?.['fotos'] ?? [],
    };
}

export async function crearPublicacion(req: Request, res: Response): Promise<void> {
    /** Indica si los archivos subidos ya fueron asignados a la publicación.
     *  Si es false al salir (error), hay que limpiarlos del disco. */
    let filesOwned = false;

    try {
        parseMultipartBody(req.body);

        const { error, value } = createPublicacionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            eliminarArchivosSubidos(req);
            sendError(res, error.details.map((d) => d.message), 400);
            return;
        }

        const { place_id, titulo, descripcion, precio, telefono, permitir_comentarios, etiquetas = [] } = value;

        await etiquetaService.validarEtiquetasNoExcluyentes(etiquetas);

<<<<<<< HEAD
        // Validar que esté dentro del rango de 2000m de una universidad
        const resultados = await distanciaMinima(place_id);

        if (!resultados || resultados.length === 0) {
            eliminarArchivosSubidos(req);
=======
        // Validar que este dentro del rango de 2000m de una universidad
        const resultados = await distanciaMinima(place_id);

        if (!resultados || resultados.length === 0) {
>>>>>>> origin/dev
            sendError(res, 'la publicación debe estar a máximo 2000 metros de una universidad', 400);
            return;
        }

        const direccion = resultados[0]?.direccion

        if (!direccion) {
            eliminarArchivosSubidos(req);
            sendError(res, 'No se pudo obtener la dirección', 500);
            return;
        }

        const existe = await direccionExiste(direccion);

        if (existe) {
            eliminarArchivosSubidos(req);
            sendError(res, 'Ya existe una publicación con esa dirección', 400);
            return;
        }

        const coordenadas = resultados[0]?.coordenadas;

        if (!coordenadas) {
            eliminarArchivosSubidos(req);
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

        filesOwned = true;

        // Archivos subidos
        const { portada, fotos } = getFiles(req);

        // La portada ya fue validada por uploadImagen.middleware
        await publicacionService.addFoto(nueva.id_publicacion, `/uploads/${portada!.filename}`, true);

        for (const foto of fotos) {
            await publicacionService.addFoto(nueva.id_publicacion, `/uploads/${foto.filename}`, false);
        }

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

        // Si el usuario es "registrado", pasarlo a "publicante"
        const usuarioDb = await obtenerPorId(publicante.id_usuario);
        let nuevoToken: string | undefined;

        if (usuarioDb && usuarioDb.rol === Rol.REGISTRADO) {
            await actualizar(publicante.id_usuario, { rol: Rol.PUBLICANTE });
            nuevoToken = generarToken({ id: publicante.id_usuario, rol: Rol.PUBLICANTE });
        }
        
        sendSuccess(res, { publicacion: nueva, resultados, token: nuevoToken }, 'Publicación creada', 201);
    } catch (err) {
        if (!filesOwned) eliminarArchivosSubidos(req);
        sendError(res, 'Error al crear publicación', 500);
    }
}

export async function obtenerPublicacion(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = idPublicacionParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message), 400);
            return;
        }

        const id = Number(value.id_publicacion);

        if (Number.isNaN(id)) {
            sendError(res, 'id_publicación inválido', 400);
            return;
        }

        const publicacion = await publicacionService.findOne(id);

        if (!publicacion) {
            sendError(res, 'Publicación no encontrada', 404);
            return;
        }

        sendSuccess(res, publicacion, 'Publicación obtenida', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicación', 500);
    }
}

export async function actualizarPublicacion(req: Request, res: Response): Promise<void> {
    /** Indica si los archivos subidos ya se enlazaron a la publicación (addFoto).
     *  Si es false al salir por error, hay que limpiarlos del disco. */
    let filesOwned = false;

    try {
        parseMultipartBody(req.body);

        const { error: paramsError, value: paramsValue } = idPublicacionParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        const { error: bodyError, value: bodyValue } = updatePublicacionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (paramsError) {
            eliminarArchivosSubidos(req);
            sendError(res, paramsError.details.map((d) => d.message), 400);
            return;
        }

        if (bodyError) {
            eliminarArchivosSubidos(req);
            sendError(res, bodyError.details.map((d) => d.message), 400);
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
            eliminar_etiquetas = [],
            nuevas_etiquetas = [],
        } = bodyValue;

        const id = Number(id_publicacion);

        if (Number.isNaN(id)) {
            eliminarArchivosSubidos(req);
            sendError(res, 'id_publicación inválido', 400);
            return;
        }

        const publicacion = await publicacionService.findOne(id);

        if (!publicacion) {
            eliminarArchivosSubidos(req);
            sendError(res, 'Publicación no encontrada', 404);
            return;
        }

        const datosActualizados: Partial<Publicacion> = {};

        // Solo guardar campos que REALMENTE cambiaron
        if (titulo !== undefined && titulo !== publicacion.titulo) datosActualizados.titulo = titulo;
        if (descripcion !== undefined && descripcion !== publicacion.descripcion) datosActualizados.descripcion = descripcion;
        if (precio !== undefined && Number(precio) !== Number(publicacion.precio)) datosActualizados.precio = Number(precio);
        if (telefono !== undefined && telefono !== publicacion.telefono) datosActualizados.telefono = telefono;
        if (permitir_comentarios !== undefined && permitir_comentarios !== publicacion.permitir_comentarios) datosActualizados.permitir_comentarios = permitir_comentarios;
        if (estado !== undefined) datosActualizados.estado = estado;

        // Solo cambios visibles que sean DIFERENTES a lo actual justifican re‑revisión
        const archivosSubidos = getFiles(req);
        const hayCambiosVisibles =
            datosActualizados.titulo !== undefined ||
            datosActualizados.descripcion !== undefined ||
            eliminar_fotos.length > 0 ||
            !!archivosSubidos.portada ||
            archivosSubidos.fotos.length > 0;

        // Si la publicación estaba activa o inactiva y hay cambios visibles,
        // volver a pendiente para re‑revisión
        const necesitaReRevision = hayCambiosVisibles &&
            ![Estado.PENDIENTE, Estado.ELIMINADA].includes(publicacion.estado as Estado);
        
        // Forzar re‑revisión si corresponde
        if (necesitaReRevision) {
            datosActualizados.estado = Estado.PENDIENTE;
        }

        // Actualizar la publicación solo si hay cambios
        if(Object.keys(datosActualizados).length > 0) {
            await publicacionService.update(id, datosActualizados);
        }

        // Eliminar fotos (borra archivo físico también)
        for (const idFoto of eliminar_fotos) {
            if (typeof idFoto === 'number') {
                await publicacionService.removeFoto(idFoto);
            }
        }

        // Archivos subidos
        const { portada: nuevaPortada, fotos: nuevasFotos } = getFiles(req);

        // Si subieron una portada nueva, reemplazar la anterior
        if (nuevaPortada) {
            // Remover la portada anterior (si existe), salvo que ya se haya
            // eliminado via eliminar_fotos (para evitar doble-borrado)
            const viejaPortada = publicacion.fotos?.find((f) => f.es_portada);
            if (viejaPortada && !eliminar_fotos.includes(viejaPortada.id_foto)) {
                await publicacionService.removeFoto(viejaPortada.id_foto);
            }
            await publicacionService.addFoto(id, `/uploads/${nuevaPortada.filename}`, true);
            filesOwned = true;
        }

        // Añadir nuevas fotos
        for (const foto of nuevasFotos) {
            await publicacionService.addFoto(id, `/uploads/${foto.filename}`, false);
            filesOwned = true;
        }

        const idsActuales = (publicacion.etiquetas ?? []).map((e) => e.id_etiqueta);

        const idsFinales = [
            ...new Set([
                ...idsActuales.filter((id) => !eliminar_etiquetas.includes(id)),
                ...nuevas_etiquetas,
            ]),
        ];

        await etiquetaService.validarEtiquetasNoExcluyentes(idsFinales);

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
        if (!filesOwned) eliminarArchivosSubidos(req);
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
            sendError(res, error.details.map((d) => d.message), 400);
            return;
        }
        const id = Number(value.id_publicacion);

        if(Number.isNaN(id)) {
            sendError(res, 'id_publicación inválido', 400);
            return;
        }

        // Eliminar publicación (el service ya borra las fotos físicas)
        await publicacionService.delete(id);
        sendSuccess(res, null, 'Publicación eliminada', 200);
    } catch (err) {
        sendError(res, 'Error al eliminar publicación', 500);
    }
}

export async function toggleEstadoPublicacion(req: Request, res: Response): Promise<void> {
    try {
        const { error: paramsError, value: paramsValue } = idPublicacionParamSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (paramsError) {
            sendError(res, paramsError.details.map((d) => d.message), 400);
            return;
        }

        const { error: bodyError, value: bodyValue } = toggleEstadoSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (bodyError) {
            sendError(res, bodyError.details.map((d) => d.message), 400);
            return;
        }

        const id = Number(paramsValue.id_publicacion);
        const { estado } = bodyValue;
        const esAdmin = req.user?.rol === "administrador";

        const publicacion = await publicacionService.findOne(id);
        if (!publicacion) {
            sendError(res, 'Publicación no encontrada', 404);
            return;
        }

        if (publicacion.estado === estado) {
            sendError(res, `La publicación ya se encuentra en estado "${estado}"`, 400);
            return;
        }

        if (esAdmin) {
            // Admin puede cambiar a cualquier estado válido
            if (![Estado.ACTIVA, Estado.INACTIVA, Estado.ELIMINADA].includes(estado)) {
                sendError(res, `El estado "${estado}" no es válido para esta operación`, 400);
                return;
            }
        } else {
            // Dueño solo puede toggle entre activa ↔ inactiva
            if (publicacion.estado === Estado.PENDIENTE) {
                sendError(res, 'No puedes cambiar el estado de una publicación en revisión', 400);
                return;
            }

            if (![Estado.ACTIVA, Estado.INACTIVA].includes(estado)) {
                sendError(res, `El estado "${estado}" no es válido para esta operación`, 400);
                return;
            }
        }

        const publicacionActualizada = await publicacionService.update(id, { estado });
        sendSuccess(res, publicacionActualizada, 'Estado actualizado', 200);
    } catch (err) {
        sendError(res, 'Error al actualizar el estado de la publicación', 500);
    }
}

export async function obtenerPublicacionesPorFiltros(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = filtrosPublicacionSchema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            sendError(res, error.details.map((d) => d.message), 400);
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
            sendError(res, error.details.map((d) => d.message), 400);
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
            sendError(res, error.details.map((d) => d.message), 400);
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
            sendError(res, error.details.map((d) => d.message), 400);
            return;
        }

        const id_usuario = Number(value.id_usuario);

        const publicaciones = await publicacionService.findByPublicanteInactivas(id_usuario);
        sendSuccess(res, publicaciones, 'Publicaciones inactivas del usuario obtenidas', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicaciones inactivas del usuario', 500);
    }
}
<<<<<<< HEAD
=======

export async function obtenerPublicacionPorId(req: Request, res: Response): Promise<void> {
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

        if (Number.isNaN(id)) {
            sendError(res, 'id_publicación inválido', 400);
            return;
        }

        const publicacion = await publicacionService.findOneDetalle(id);

        if (!publicacion) {
            sendError(res, 'Publicación no encontrada', 404);
            return;
        }

        sendSuccess(res, publicacion, 'Publicación obtenida', 200);
    } catch (err) {
        sendError(res, 'Error al obtener publicación', 500);
    }
}
>>>>>>> origin/dev
