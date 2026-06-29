import { AppDataSource } from '../config/db.config.js';
import { Valoracion } from '../entities/valoracion.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';

export class ValoracionService {
  private valoracionRepo = AppDataSource.getRepository(Valoracion);
  private publicacionRepo = AppDataSource.getRepository(Publicacion);

  async crear(id_usuario: number, data: { id_publicacion: number; puntuacion: number }) {
    // 1. Verificar si la publicación existe
    const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion: data.id_publicacion });
    if (!publicacion) {
      throw new Error('NOT_FOUND: La publicación no existe');
    }

    // 2. Regla de Negocio (RF_4): Verificar si el usuario ya valoró esta publicación
    const valoracionExistente = await this.valoracionRepo.findOne({
      where: { id_usuario, id_publicacion: data.id_publicacion },
    });

    if (valoracionExistente) {
      throw new Error('BAD_REQUEST: Ya has valorado esta publicación anteriormente');
    }

    // 3. Crear y guardar la nueva valoración
    const nuevaValoracion = this.valoracionRepo.create({
      id_usuario,
      id_publicacion: data.id_publicacion,
      puntuacion: data.puntuacion,
    });
    
    await this.valoracionRepo.save(nuevaValoracion);

    // 4. Recalcular y actualizar el promedio de la publicación
    const { promedio } = await this.valoracionRepo
      .createQueryBuilder('valoracion')
      .select('AVG(valoracion.puntuacion)', 'promedio')
      .where('valoracion.id_publicacion = :id_publicacion', { id_publicacion: data.id_publicacion })
      .getRawOne();

    // Guardamos el promedio redondeado a un decimal (ej: 4.5)
    publicacion.promedio_valoracion = Math.round(parseFloat(promedio) * 10) / 10;
    await this.publicacionRepo.save(publicacion);

    return nuevaValoracion;
  }
}