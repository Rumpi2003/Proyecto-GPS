import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

export enum Motivo {
    FRAUDE = 'sospecha fraude',
    INFORMACION_FALSA = 'información falsa',
    PRECIO_ENGAÑOSO = 'precio engañoso',
    NO_DISPONIBLE = 'arriendo no disponible',
    PUBLICACION_DUPLICADA = 'publicación duplicada',
    CONTENIDO_INAPROPIADO = 'contenido inapropiado',
    OTRO = 'otro',
}

export enum Estado {
    PENDIENTE = 'pendiente',
    CONFIRMADO = 'confirmado',
    ARCHIVADO = 'archivado',
    DESESTIMADO = 'desestimado',
}

@Entity({ name: 'reporte_publi' })
export class ReportePubli {
    @PrimaryGeneratedColumn({ name: 'id_reporte', type: 'int' })
    id_reporte!: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.reportesPublicaciones, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: UsuarioType;

    @ManyToOne(() => Publicacion, (publicacion) => publicacion.reportes, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion!: PublicacionType;

    @Column({ type: 'enum', enum: Motivo })
    motivo!: Motivo;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    detalle!: string | null;

    @Column({ type: 'enum', enum: Estado, default: Estado.PENDIENTE })
    estado!: Estado;

    // Campos de auditoría de seguridad integrados
    @Column({ type: 'varchar', length: 45, nullable: false })
    ip_reporte!: string;

    @Column({ type: 'text', nullable: false })
    user_agent!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_reporte!: Date;
}