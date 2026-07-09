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

    const publicacion = await this.publicacionRepo.findOne({
      where: { id_publicacion: Number(data.id_publicacion) },
      relations: ['publicante'],
    });

    if (!publicacion) throw new Error('NOT_FOUND: Publicación no encontrada');

    if (publicacion.publicante?.id_usuario === id_usuario) {
      throw new Error("BAD_REQUEST: No puedes reportar tu propia publicación");
    }

    // Verificar si ya existe un reporte pendiente del mismo usuario sobre esta publicación
    const reportePendiente = await this.reporteRepo.findOne({
      where: {
        usuario: { id_usuario },
        publicacion: { id_publicacion: publicacion.id_publicacion },
        estado: Estado.PENDIENTE,
      },
    });

    if (reportePendiente) {
      throw new Error('BAD_REQUEST: Ya existe un reporte pendiente para esta publicación');
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

  async listarPendientes() {
    return this.reporteRepo.find({
      where: { estado: Estado.PENDIENTE },
      relations: ['publicacion'],
      order: { fecha_reporte: 'DESC' },
    });
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
      const PERIODO_DIAS = 30;

      const desde = new Date();
      desde.setDate(desde.getDate() - PERIODO_DIAS);

      const reportesConfirmados = await this.reporteRepo.count({
        where: {
          publicacion: { id_publicacion: reporte.publicacion.id_publicacion },
          estado: Estado.CONFIRMADO,
          fecha_reporte: MoreThanOrEqual(desde),
        },
      });

      if (reportesConfirmados >= LIMITE_REPORTES) {
        // En lugar de solo un console.log, podríamos cambiar el estado de la publicación
        const publicacion = await this.publicacionRepo.findOneBy({ id_publicacion: reporte.publicacion.id_publicacion });
        if (publicacion) {
            publicacion.estado = EstadoPublicacion.ELIMINADA; // o INACTIVA
            await this.publicacionRepo.save(publicacion);
            
            const id_publicacion = reporte.publicacion.id_publicacion; // Guardar ID antes de cambiar
            
            // Marcar todos los demás reportes PENDIENTES como CONFIRMADOS
            await this.reporteRepo.update(
              {
                publicacion: { id_publicacion },
                estado: Estado.PENDIENTE,
              },
              { estado: Estado.CONFIRMADO }
            );
            
            // TODO (RF_12): enviar notificación real por correo al publicador cuando exista servicio de email
            console.log(`ALERTA: La publicación ${publicacion.id_publicacion} alcanzó el límite de reportes confirmados en los últimos ${PERIODO_DIAS} días y ha sido dada de baja.`);
        }
      } else {
        // TODO (RF_12): enviar notificación real por correo al publicador con el motivo del reporte confirmado
        console.log(`NOTIFICACIÓN: Se confirmó un reporte (motivo: ${reporte.motivo}) para la publicación ${reporte.publicacion.id_publicacion}.`);
      }
    }


    return reporte;
  }
}