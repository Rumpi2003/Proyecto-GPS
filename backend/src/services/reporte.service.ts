import { AppDataSource } from '../config/db.config.js';
import { Reporte, Motivo, Estado } from '../entities/reporte.entity.js';
import { Usuario } from '../entities/usuario.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';
import type { Reporte as ReporteType } from '../entities/reporte.entity.js';

export const crearReporte = async (
  id_usuario: number,
  id_publicacion: number,
  motivo: Motivo,
  detalle?: string,
): Promise<ReporteType> => {
  const reporte = AppDataSource.getRepository(Reporte);
  const usuarioReporte = AppDataSource.getRepository(Usuario);
  const publicacionReporte = AppDataSource.getRepository(Publicacion);


  // Verificar si el usuario y la publicación existen (no se si esto se middleware a futuro, o en validations)
  const usuario = await usuarioReporte.findOneBy({ id_usuario });
  if (!usuario) throw new Error('Usuario no encontrado');

  const publicacion = await publicacionReporte.findOneBy({ id_publicacion });
  if (!publicacion) throw new Error('Publicación no encontrada');

  const nuevo = reporte.create({
    usuario,
    publicacion,
    motivo,
    detalle: detalle ?? null,
    estado: Estado.PENDIENTE,
  } as unknown as ReporteType);

  return await reporte.save(nuevo);
};

export const obtenerPorPublicacion = async (id_publicacion: number): Promise<ReporteType[]> => {
  const reporte = AppDataSource.getRepository(Reporte);
  return await reporte.find({
    where: { publicacion: { id_publicacion } as any },
    relations: ['usuario', 'publicacion'],
    order: { fecha_reporte: 'DESC' },
  });
};

export const obtenerPorUsuario = async (id_usuario: number): Promise<ReporteType[]> => {
  const reporte = AppDataSource.getRepository(Reporte);
  return await reporte.find({
    where: { usuario: { id_usuario } as any },
    relations: ['usuario', 'publicacion'],
    order: { fecha_reporte: 'DESC' },
  });
};

//Con esto podemos llamar a las funciones desde otros archivos
export default {
  crearReporte,
  obtenerPorPublicacion,
  obtenerPorUsuario,
};
