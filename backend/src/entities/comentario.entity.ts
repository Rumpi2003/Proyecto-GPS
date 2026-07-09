import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';
import { ReporteComentario } from './reporteCom.entity.js';
import type { ReporteComentario as ReporteComentarioType } from './reporteCom.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

@Entity({ name: 'comentario' })
export class Comentario {
    // 1. Agregamos el identificador único autoincremental
    @PrimaryGeneratedColumn({ name: 'id_comentario', type: 'int' })
    id_comentario!: number;

    // 2. Mantenemos las relaciones (TypeORM generará las columnas id_usuario e id_publicacion automáticamente)
    @ManyToOne(() => Usuario, (usuario) => usuario.comentarios, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: UsuarioType;

    @ManyToOne(() => Publicacion, (publicacion) => publicacion.comentarios, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion!: PublicacionType;

    @Column({ type: 'varchar', length: 255 })
    texto!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_comentario!: Date;

    @OneToMany(() => ReporteComentario, (reporte) => reporte.comentario)
    reportes!: ReporteComentarioType[];
}