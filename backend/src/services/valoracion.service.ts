import { AppDataSource } from '../config/db.config.js';
import { Valoracion } from '../entities/valoracion.entity.js';
import { Usuario } from '../entities/usuario.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';
import type { Valoracion as ValoracionType } from '../entities/valoracion.entity.js';

export const crearValoracion = async (
  id_usuario: number,
  id_publicacion: number,
  puntuacion: number,
): Promise<ValoracionType> => {
  const repo = AppDataSource.getRepository(Valoracion);
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const publicacionRepo = AppDataSource.getRepository(Publicacion);

  const usuario = await usuarioRepo.findOneBy({ id_usuario });
  if (!usuario) throw new Error('Usuario no encontrado');

  const publicacion = await publicacionRepo.findOneBy({ id_publicacion });
  if (!publicacion) throw new Error('Publicación no encontrada');

  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    throw new Error('Puntuación inválida (debe ser entero entre 1 y 5)');
  }

  // comprobar si ya existe una valoración del mismo usuario a la misma publicación
  const existente = await repo.findOne({ where: { id_usuario, id_publicacion } as any });
  let guardada: ValoracionType;

  if (existente) {
    existente.puntuacion = puntuacion;
    guardada = await repo.save(existente as any);
  } else {
    const nueva = repo.create({
      id_usuario,
      id_publicacion,
      usuario,
      publicacion,
      puntuacion,
    } as unknown as ValoracionType);
    guardada = await repo.save(nueva);
  }

  // recalcular promedio de la publicación y actualizar (tipado seguro)
  const todas = await repo.find({ where: { publicacion: { id_publicacion } as any } }) as unknown as ValoracionType[];
  const sum = todas.reduce<number>((acc, v) => acc + (v.puntuacion ?? 0), 0);
  const promedio = todas.length > 0 ? sum / todas.length : 0;
  publicacion.promedio_valoracion = parseFloat(promedio.toFixed(2));
  await publicacionRepo.save(publicacion);

  return guardada;
};

export const obtenerPorPublicacion = async (id_publicacion: number): Promise<ValoracionType[]> => {
  const repo = AppDataSource.getRepository(Valoracion);
  return await repo.find({
    where: { publicacion: { id_publicacion } as any },
    relations: ['usuario', 'publicacion'],
    order: { /* no fecha, keep default */ },
  });
};

export const obtenerPorUsuario = async (id_usuario: number): Promise<ValoracionType[]> => {
  const repo = AppDataSource.getRepository(Valoracion);
  return await repo.find({
    where: { usuario: { id_usuario } as any },
    relations: ['usuario', 'publicacion'],
    order: { /* no fecha, keep default */ },
  });
};

export default {
  crearValoracion,
  obtenerPorPublicacion,
  obtenerPorUsuario,
};
