import { AppDataSource } from '../config/db.config.js';
import { Comentario } from '../entities/comentario.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';

export class ComentarioService {
  private comentarioRepo = AppDataSource.getRepository(Comentario);
  private publicacionRepo = AppDataSource.getRepository(Publicacion);

  async crear(id_usuario: number, data: { id_publicacion: number; texto: string }) {
    // 1. Verificar si la publicación existe
    const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion: data.id_publicacion });
    if (!publicacion) {
      throw new Error('NOT_FOUND: La publicación no existe');
    }

    if (publicacion.publicante?.id_usuario === id_usuario) {
      throw new Error('BAD_REQUEST: No puedes comentar tu propia publicación');
    }

    // 2. Regla de Negocio (RF_9): Verificar si los comentarios están habilitados
    // Se asume que existe la propiedad 'permitir_comentarios' en la entidad Publicacion
    if (publicacion.permitir_comentarios === false) {
      throw new Error('BAD_REQUEST: Esta publicación tiene los comentarios deshabilitados');
    }

    // RF_3: no hay límite de comentarios por usuario/publicación, se permite comentar múltiples veces

    // Crear el comentario
    const nuevoComentario = this.comentarioRepo.create({
      usuario: { id_usuario: id_usuario },
      publicacion: { id_publicacion: data.id_publicacion },
      texto: data.texto
    });

    return await this.comentarioRepo.save(nuevoComentario);
  }

  async obtenerPorPublicacion(id_publicacion: number) {
    // Verificar si la publicación existe antes de buscar comentarios
    const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion });
    if (!publicacion) {
      throw new Error('NOT_FOUND: La publicación no existe');
    }

    // CORRECCIÓN 3: Eliminar el 'where' duplicado y usar el parámetro 'id_publicacion'
    return await this.comentarioRepo.find({
      where: { publicacion: { id_publicacion: id_publicacion } },
      relations: ['usuario'], // Retornar los datos del usuario que comentó
      order: { fecha_comentario: 'DESC' }, // Los más recientes primero
    });
  }
}