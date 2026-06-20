import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Publicacion } from './publicacion.entity.js';
import { Universidad } from './universidad.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';
import type { Universidad as UniversidadType } from './universidad.entity.js';

@Entity({ name: 'cercania' })
export class Cercania {
	@PrimaryGeneratedColumn({ name: 'id_cercania', type: 'int' })
	id_cercania!: number;

	@ManyToOne(() => Publicacion, (publicacion) => publicacion.cercanias, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_publicacion' })
	publicacion!: PublicacionType;

	@ManyToOne(() => Universidad, (universidad) => universidad.cercanias, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_universidad' })
	universidad!: UniversidadType;

	@Column({ type: 'int' })
	distancia!: number;
}
