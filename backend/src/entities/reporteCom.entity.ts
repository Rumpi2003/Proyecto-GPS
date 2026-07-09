import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Comentario } from './comentario.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Comentario as ComentarioType } from './comentario.entity.js';

export enum MotivoComentario {
    SPAM = 'spam o publicidad',
    LENGUAJE_OFENSIVO = 'lenguaje ofensivo',
    ACOSO = 'acoso o bullying',
}

export enum EstadoReporte {
    PENDIENTE = 'pendiente',
    CONFIRMADO = 'confirmado',
    ARCHIVADO = 'archivado',
    DESESTIMADO = 'desestimado',
}

@Entity({ name: 'reporte_comentario' })
export class ReporteComentario {
    @PrimaryGeneratedColumn({ name: 'id_reporte_com', type: 'int' })
    id_reporte_com!: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.reportesComentarios, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: UsuarioType;

    @ManyToOne(() => Comentario, (comentario) => comentario.reportes, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_comentario' })
    comentario!: ComentarioType;

    @Column({ type: 'enum', enum: MotivoComentario })
    motivo!: MotivoComentario;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    detalle!: string | null;

    @Column({ type: 'enum', enum: EstadoReporte, default: EstadoReporte.PENDIENTE })
    estado!: EstadoReporte;

    // Campos de auditoría de seguridad obligatorios
    @Column({ type: 'varchar', length: 45, nullable: false })
    ip_reporte!: string;

    @Column({ type: 'text', nullable: false })
    user_agent!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_reporte!: Date;
}