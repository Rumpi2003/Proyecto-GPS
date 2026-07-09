import { AppDataSource } from '../config/db.config.js';
import { ReporteComentario, EstadoReporte, MotivoComentario } from '../entities/reporteCom.entity.js';
import { Usuario, Rol } from '../entities/usuario.entity.js';
import { Comentario } from '../entities/comentario.entity.js';
import { In } from 'typeorm';

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

    // Verificar si ya existe un reporte pendiente del mismo usuario sobre este comentario
    const reportePendiente = await this.reporteRepo.findOne({
      where: {
        usuario: { id_usuario },
        comentario: { id_comentario: comentario.id_comentario },
        estado: EstadoReporte.PENDIENTE,
      },
    });

    if (reportePendiente) {
      throw new Error('BAD_REQUEST: Ya existe un reporte pendiente para este comentario');
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

  async obtenerMisReportes(id_usuario: number, idsComentario: number[]): Promise<number[]> {
    if (idsComentario.length === 0) return [];

    const reportes = await this.reporteRepo.find({
      where: {
        usuario: { id_usuario },
        comentario: { id_comentario: In(idsComentario) },
        estado: EstadoReporte.PENDIENTE,
      },
      relations: ['comentario'],
      select: {
        comentario: {
          id_comentario: true,
        },
      },
    });

    return reportes.map((r) => r.comentario.id_comentario);
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
      const id_comentario = reporte.comentario.id_comentario; // Guardar ID antes de eliminar
      
      await this.comentarioRepo.remove(reporte.comentario);
      
      // Marcar todos los demás reportes PENDIENTES del mismo comentario como CONFIRMADOS
      await this.reporteRepo.update(
        {
          comentario: { id_comentario },
          estado: EstadoReporte.PENDIENTE,
        },
        { estado: EstadoReporte.CONFIRMADO }
      );
    }

    return reporteGuardado;
  }
}