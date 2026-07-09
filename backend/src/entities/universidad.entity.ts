import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cercania } from './cercania.entity.js';
import type { Cercania as CercaniaType } from './cercania.entity.js';

@Entity({ name: 'universidad' })
export class Universidad {
	@PrimaryGeneratedColumn({ name: 'id_universidad', type: 'int' })
	id_universidad!: number;

	@Column({ type: 'varchar', length: 255 })
	nombre_universidad!: string;

	@Column({ type: 'varchar', length: 255 })
	direccion!: string;

	@Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
	coordenadas!: object;

	@OneToMany(() => Cercania, (cercania) => cercania.universidad)
	cercanias!: CercaniaType[];
}
