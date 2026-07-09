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

    const comentarioExistente = await this.comentarioRepo.findOneBy({
      id_usuario,
      id_publicacion: data.id_publicacion,
    });

    if (comentarioExistente) {
      throw new Error('BAD_REQUEST: Ya has comentado esta publicación');
    }

    // 3. Crear el comentario
    const nuevoComentario = this.comentarioRepo.create({
      id_usuario,
      id_publicacion: data.id_publicacion,
      texto: data.texto,
    });

    return await this.comentarioRepo.save(nuevoComentario);
  }

  async obtenerPorPublicacion(id_publicacion: number) {
    // Verificar si la publicación existe antes de buscar comentarios
    const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion });
    if (!publicacion) {
      throw new Error('NOT_FOUND: La publicación no existe');
    }

    return await this.comentarioRepo.find({
      where: { id_publicacion },
      relations: ['usuario'], // Retornar los datos del usuario que comentó
      order: { fecha_comentario: 'DESC' }, // Los más recientes primero
    });
  }
}