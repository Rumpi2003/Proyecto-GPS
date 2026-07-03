import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

export enum Motivo {
	FRAUDE = 'sospecha fraude',
    INFORMACION_FALSA = 'información falsa',
    PRECIO_ENGAÑOSO = 'precio engañoso',
    NO_DISPONIBLE = 'producto no disponible',
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

@Entity({ name: 'reporte' })
export class Reporte {
    @PrimaryGeneratedColumn({ name: 'id_reporte', type: 'int' })
    id_reporte!: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.id_usuario, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: UsuarioType;

    @ManyToOne(() => Publicacion, (publicacion) => publicacion.id_publicacion, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion!: PublicacionType;

    @Column({ type: 'enum', enum: Motivo })
    motivo!: Motivo;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    detalle!: string | null;

    @Column({ type: 'enum', enum: Estado, default: Estado.PENDIENTE })
    estado!: Estado;

    // Campos opcionales para auditoría del reporte
    //@Column({ type: 'varchar', length: 45, nullable: true })
    //ip_reporte!: string | null;

    //@Column({ type: 'varchar', length: 255, nullable: true })
    //user_agent!: string | null;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_reporte!: Date;
}