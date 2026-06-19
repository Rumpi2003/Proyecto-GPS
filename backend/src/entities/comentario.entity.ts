import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

@Entity({ name: 'comentario' })
export class Comentario {
	@PrimaryGeneratedColumn({ name: 'id_comentario', type: 'int' })
	id_comentario!: number;

	@ManyToOne(() => Usuario, (usuario) => usuario.comentarios, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_usuario' })
	usuario!: UsuarioType;

	@ManyToOne(() => Publicacion, (publicacion) => publicacion.comentarios, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_publicacion' })
	publicacion!: PublicacionType;

	@Column({ type: 'varchar', length: 255 })
	texto!: string;
}
