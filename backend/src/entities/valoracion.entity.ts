import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

@Entity({ name: 'valoracion' })
export class Valoracion {
    @PrimaryColumn({ name : 'id_usuario', type: 'int' })
    id_usuario!: number;

    @PrimaryColumn({ name : 'id_publicacion', type: 'int' })
    id_publicacion!: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.valoraciones, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario!: UsuarioType;

    @ManyToOne(() => Publicacion, (publicacion) => publicacion.valoraciones, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion!: PublicacionType;

    @Column({ type: 'int' })
    puntuacion!: number;
}