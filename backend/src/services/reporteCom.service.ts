import { AppDataSource } from '../config/db.config.js';
import { ReporteComentario, EstadoReporte, MotivoComentario } from '../entities/reporteCom.entity.js';
import { Usuario, Rol } from '../entities/usuario.entity.js';
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

    // RF_10: Solo el publicador puede reportar comentarios de sus propias publicaciones
    // (Administrador es un rol independiente que no publica, por lo que no aplica aquí)
    if (usuario.rol !== Rol.PUBLICANTE) {
      throw new Error('FORBIDDEN: Solo un usuario publicador puede reportar comentarios');
    }

    const comentario = await this.comentarioRepo.findOne({
      where: { id_comentario: Number(data.id_comentario) },
      relations: ['publicacion', 'publicacion.publicante'],
    });
    if (!comentario) throw new Error('NOT_FOUND: Comentario no encontrado');

    if (comentario.publicacion.publicante.id_usuario !== id_usuario) {
      throw new Error('FORBIDDEN: Solo puedes reportar comentarios de tus propias publicaciones');
    }

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

  async listarPendientes() {
    return this.reporteRepo.find({
      where: { estado: EstadoReporte.PENDIENTE },
      relations: ['comentario', 'comentario.usuario', 'comentario.publicacion'],
      select: {
        comentario: {
          id_comentario: true,
          texto: true,
          fecha_comentario: true,
          usuario: {
            id_usuario: true,
            nombre: true,
          },
          publicacion: {
            id_publicacion: true,
            titulo: true,
          },
        },
      },
      order: { fecha_reporte: 'DESC' },
    });
  }

  async evaluar(id_reporte_com: number, nuevoEstado: EstadoReporte) {
    const reporte = await this.reporteRepo.findOne({
      where: { id_reporte_com },
      relations: ['comentario'],
    });

    if (!reporte) throw new Error('NOT_FOUND: Reporte no encontrado');

    reporte.estado = nuevoEstado;
    const reporteGuardado = await this.reporteRepo.save(reporte);

    // Si se confirma el reporte, el comentario se elimina por su carácter inapropiado
    if (nuevoEstado === EstadoReporte.CONFIRMADO) {
      await this.comentarioRepo.remove(reporte.comentario);
    }

    return reporteGuardado;
  }
}