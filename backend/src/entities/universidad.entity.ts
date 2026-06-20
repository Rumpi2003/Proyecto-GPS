import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cercania } from './cercania.entity.js';

@Entity({ name: 'universidad' })
export class Universidad {
	@PrimaryGeneratedColumn({ name: 'id_universidad', type: 'int' })
	id_universidad!: number;

	@Column({ type: 'varchar', length: 255 })
	nombre!: string;

	@Column({ name: 'ciudad_comuna', type: 'varchar', length: 255 })
	ciudadComuna!: string;

	@Column({ type: 'varchar', length: 255 })
	calle!: string;

	@Column({ type: 'varchar', length: 50 })
	numero!: string;

	@Column({ type: 'varchar', length: 255 })
	latitud!: string;

	@Column({ type: 'varchar', length: 255 })
	longitud!: string;

	@OneToMany(() => Cercania, (cercania) => cercania.universidad)
	cercanias!: Cercania[];
}
