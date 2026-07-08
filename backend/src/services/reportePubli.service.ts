import { AppDataSource } from '../config/db.config.js';
import { ReportePubli, Estado, Motivo } from '../entities/reportePubli.entity.js';
import { Usuario } from '../entities/usuario.entity.js';
import { Publicacion, Estado as EstadoPublicacion } from '../entities/publicacion.entity.js';
import { MoreThanOrEqual } from 'typeorm';

export type CrearReportePubliData = {
  id_publicacion: number;
  motivo: Motivo;
  detalle?: string | null;
  ip_reporte: string;
  user_agent: string;
};

export class ReportePubliService {
  private reporteRepo = AppDataSource.getRepository(ReportePubli);
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private publicacionRepo = AppDataSource.getRepository(Publicacion);

  async crear(id_usuario: number, data: CrearReportePubliData) {
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
      detalle: data.detalle ?? null,
      estado: Estado.PENDIENTE,
      ip_reporte: data.ip_reporte,
      user_agent: data.user_agent
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
    if (nuevoEstado === Estado.CONFIRMADO) { 
      const LIMITE_REPORTES = 5;
      
      const reportesConfirmados = await this.reporteRepo.count({
        where: {
          publicacion: { id_publicacion: reporte.publicacion.id_publicacion },
          estado: Estado.CONFIRMADO,
        },
      });

      if (reportesConfirmados >= LIMITE_REPORTES) {
        // En lugar de solo un console.log, podríamos cambiar el estado de la publicación
        const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion: reporte.publicacion.id_publicacion });
        if (publicacion) {
            publicacion.estado = EstadoPublicacion.ELIMINADA; // o INACTIVA
            await this.publicacionRepo.save(publicacion);
            console.log(`ALERTA: La publicación ${publicacion.id_publicacion} alcanzó el límite de reportes y ha sido dada de baja.`);
        }
      }
    }

    return reporte;
  }
}