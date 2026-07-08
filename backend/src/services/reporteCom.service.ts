import { AppDataSource } from '../config/db.config.js';
import { ReporteComentario, EstadoReporte, MotivoComentario } from '../entities/reporteCom.entity.js';
import { Usuario } from '../entities/usuario.entity.js';
import { Comentario } from '../entities/comentario.entity.js';
import { MoreThanOrEqual } from 'typeorm';

export type CrearReporteComData = {
  id_comentario: number;
  motivo: MotivoComentario;
  detalle?: string | null;
  ip_reporte: string;
  user_agent: string;
};

export class ReporteComService {
  private reporteRepo = AppDataSource.getRepository(ReporteComentario);
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private comentarioRepo = AppDataSource.getRepository(Comentario);

  async crear(id_usuario: number, data: CrearReporteComData) {
    const usuario = await this.usuarioRepo.findOneBy({ id_usuario });
    if (!usuario) throw new Error('NOT_FOUND: Usuario no encontrado');

    const comentario = await this.comentarioRepo.findOneBy({ id_comentario: Number(data.id_comentario) });
    if (!comentario) throw new Error('NOT_FOUND: Comentario no encontrado');

    // Regla de Negocio homóloga a RF_5
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const reportePrevio = await this.reporteRepo.findOne({
      where: {
        usuario: { id_usuario },
        comentario: { id_comentario: comentario.id_comentario },
        fecha_reporte: MoreThanOrEqual(hace30Dias),
      },
    });

    if (reportePrevio) {
      throw new Error('BAD_REQUEST: Ya has reportado este comentario en los últimos 30 días');
    }

    const nuevoReporte = this.reporteRepo.create({
      usuario,
      comentario,
      motivo: data.motivo,
      detalle: data.detalle ?? null,
      estado: EstadoReporte.PENDIENTE,
      ip_reporte: data.ip_reporte,
      user_agent: data.user_agent
    });

    return await this.reporteRepo.save(nuevoReporte);
  }

  async evaluar(id_reporte_com: number, nuevoEstado: EstadoReporte) {
    const reporte = await this.reporteRepo.findOne({
      where: { id_reporte_com },
      relations: ['comentario'],
    });

    if (!reporte) throw new Error('NOT_FOUND: Reporte no encontrado');

    reporte.estado = nuevoEstado;
    return await this.reporteRepo.save(reporte);
  }
}