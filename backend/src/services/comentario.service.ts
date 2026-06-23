import { AppDataSource } from '../config/db.config.js';
import { Comentario } from '../entities/comentario.entity.js';
import { Usuario } from '../entities/usuario.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';
import type { Comentario as ComentarioType } from '../entities/comentario.entity.js';

export const crearComentario = async (
  id_usuario: number,
  id_publicacion: number,
  texto: string,
): Promise<ComentarioType> => {
  const repo = AppDataSource.getRepository(Comentario);
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const publicacionRepo = AppDataSource.getRepository(Publicacion);

  const usuario = await usuarioRepo.findOneBy({ id_usuario });
  if (!usuario) throw new Error('Usuario no encontrado');

  const publicacion = await publicacionRepo.findOneBy({ id_publicacion });
  if (!publicacion) throw new Error('Publicación no encontrada');

  const nuevo = repo.create({
    id_usuario,
    id_publicacion,
    usuario,
    publicacion,
    texto,
  } as unknown as ComentarioType);

  return await repo.save(nuevo);
};

export const obtenerPorPublicacion = async (id_publicacion: number): Promise<ComentarioType[]> => {
  const repo = AppDataSource.getRepository(Comentario);
  return await repo.find({
    where: { publicacion: { id_publicacion } as any },
    relations: ['usuario', 'publicacion'],
    order: { fecha_comentario: 'DESC' },
  });
};

export const obtenerPorUsuario = async (id_usuario: number): Promise<ComentarioType[]> => {
  const repo = AppDataSource.getRepository(Comentario);
  return await repo.find({
    where: { usuario: { id_usuario } as any },
    relations: ['usuario', 'publicacion'],
    order: { fecha_comentario: 'DESC' },
  });
};

export default {
  crearComentario,
  obtenerPorPublicacion,
  obtenerPorUsuario,
};
