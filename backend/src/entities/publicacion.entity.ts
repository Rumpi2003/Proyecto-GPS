import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Comentario } from './comentario.entity.js';
import { Etiqueta } from './etiqueta.entity.js';
import { Cercania } from './cercania.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Comentario as ComentarioType } from './comentario.entity.js';
import type { Etiqueta as EtiquetaType } from './etiqueta.entity.js';
import type { Cercania as CercaniaType } from './cercania.entity.js';

@Entity({ name: 'publicacion' })
export class Publicacion {
	@PrimaryGeneratedColumn({ name: 'id_publicacion', type: 'int' })
	id_publicacion!: number;

	@ManyToOne(() => Usuario, (usuario) => usuario.publicaciones, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'id_publicante' })
	publicante!: UsuarioType;

	@Column({ type: 'varchar', length: 255 })
	titulo!: string;

	@Column({ type: 'varchar', length: 255 })
	foto!: string;

	@Column({ type: 'varchar', length: 255 })
	descripcion!: string;

	@Column({ type: 'varchar', length: 255 })
	telefono!: string;

	@Column({ type: 'float' })
	valoracion!: number;

	@Column({ name: 'ciudad_comuna', type: 'varchar', length: 255 })
	ciudadComuna!: string;

	@Column({ type: 'varchar', length: 255 })
	calle!: string;

	@Column({ type: 'int' })
	numero!: number;

	@Column({ type: 'varchar', length: 255 })
	latitud!: string;

	@Column({ type: 'varchar', length: 255 })
	longitud!: string;

	@OneToMany(() => Comentario, (comentario) => comentario.publicacion)
	comentarios!: ComentarioType[];

	@ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.publicaciones)
	@JoinTable({
		name: 'publicacion_etiqueta',
		joinColumn: { name: 'id_publicacion', referencedColumnName: 'id_publicacion' },
		inverseJoinColumn: { name: 'id_etiqueta', referencedColumnName: 'id_etiqueta' },
	})
	etiquetas!: EtiquetaType[];

	@OneToMany(() => Cercania, (cercania) => cercania.publicacion)
	cercanias!: CercaniaType[];
}
