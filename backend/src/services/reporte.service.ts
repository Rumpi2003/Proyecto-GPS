import { AppDataSource } from '../config/db.config.js';
import { Reporte, Estado } from '../entities/reporte.entity.js';
import { Usuario } from '../entities/usuario.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';
import { MoreThanOrEqual } from 'typeorm';

export class ReporteService {
  private reporteRepo = AppDataSource.getRepository(Reporte);
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private publicacionRepo = AppDataSource.getRepository(Publicacion);

  async crear(id_usuario: number, data: Partial<Reporte>) {
    const usuario = await this.usuarioRepo.findOneBy({ id_usuario });
    if (!usuario) throw new Error('NOT_FOUND: Usuario no encontrado');

    const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion: Number(data.id_publicacion) });
    if (!publicacion) throw new Error('NOT_FOUND: Publicación no encontrada');

    // Regla de Negocio (RF_5): Límite de 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const reportePrevio = await this.reporteRepo.findOne({
      where: {
        usuario: { id_usuario },
        publicacion: { id_publicacion: publicacion.id_publicacion },
        fecha_reporte: MoreThanOrEqual(hace30Dias),
      },
    });

    if (reportePrevio) {
      throw new Error('BAD_REQUEST: Ya has reportado esta publicación en los últimos 30 días');
    }

    const nuevoReporte = this.reporteRepo.create({
      usuario,
      publicacion,
      motivo: data.motivo,
      detalle: data.detalle,
      estado: Estado.PENDIENTE,
    });

    return await this.reporteRepo.save(nuevoReporte);
  }

  async evaluar(id_reporte: number, nuevoEstado: Estado) {
    const reporte = await this.reporteRepo.findOne({
      where: { id_reporte },
      relations: ['publicacion'],
    });

    if (!reporte) throw new Error('NOT_FOUND: Reporte no encontrado');

    reporte.estado = nuevoEstado;
    await this.reporteRepo.save(reporte);

    // Regla de Negocio (RF_12): Acumulación de reportes y baja
    if (nuevoEstado === Estado.RESUELTO) { 
      const LIMITE_REPORTES = 5;
      
      const reportesConfirmados = await this.reporteRepo.count({
        where: {
          publicacion: { id_publicacion: reporte.publicacion.id_publicacion },
          estado: Estado.RESUELTO,
        },
      });

      if (reportesConfirmados >= LIMITE_REPORTES) {
        console.log(`ALERTA: La publicación ${reporte.publicacion.id_publicacion} alcanzó el límite de reportes.`);
      }
    }

    return reporte;
  }

  async obtenerPendientes() {
    return await this.reporteRepo.find({
      where: { estado: Estado.PENDIENTE },
      relations: ['usuario', 'publicacion'],
      order: { fecha_reporte: 'ASC' },
    });
  }
}