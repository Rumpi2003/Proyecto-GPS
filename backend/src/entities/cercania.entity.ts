import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Publicacion } from './publicacion.entity.js';
import { Universidad } from './universidad.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';
import type { Universidad as UniversidadType } from './universidad.entity.js';

@Entity({ name: 'cercania' })
export class Cercania {
	@PrimaryColumn({ name: 'id_publicacion', type: 'int' })
	id_publicacion!: number;

	@PrimaryColumn({ name: 'id_universidad', type: 'int' })
	id_universidad!: number;

	@ManyToOne(() => Publicacion, (publicacion) => publicacion.cercanias, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_publicacion' })
	publicacion!: PublicacionType;

	@ManyToOne(() => Universidad, (universidad) => universidad.cercanias, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_universidad' })
	universidad!: UniversidadType;

	@Column({ type: 'int' })
	distancia_metros!: number;
}
