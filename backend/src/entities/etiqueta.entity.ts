import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Publicacion } from './publicacion.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

@Entity({ name: 'etiqueta' })
export class Etiqueta {
	@PrimaryGeneratedColumn({ name: 'id_etiqueta', type: 'int' })
	id_etiqueta!: number;

	@Column({ name: 'nombre_etiqueta', type: 'varchar', length: 255 })
	nombreEtiqueta!: string;

	@Column({ name: 'url_icono', type: 'varchar', length: 255 })
	url_icono!: string;

	@ManyToMany(() => Publicacion, (publicacion) => publicacion.etiquetas)
	publicaciones!: PublicacionType[];
}
