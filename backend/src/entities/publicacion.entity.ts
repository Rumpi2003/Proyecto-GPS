import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Comentario } from './comentario.entity.js';
import { Valoracion } from './valoracion.entity.js';
import { Reporte } from './reporte.entity.js';
import { Etiqueta } from './etiqueta.entity.js';
import { Cercania } from './cercania.entity.js';
import { Foto } from './foto.entity.js';
import type { Usuario as UsuarioType } from './usuario.entity.js';
import type { Comentario as ComentarioType } from './comentario.entity.js';
import type { Valoracion as ValoracionType } from './valoracion.entity.js';
import type { Reporte as ReporteType } from './reporte.entity.js';
import type { Etiqueta as EtiquetaType } from './etiqueta.entity.js';
import type { Cercania as CercaniaType } from './cercania.entity.js';
import type { Foto as FotoType } from './foto.entity.js';

export enum Estado {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
  ELIMINADA = 'eliminada'
}

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
	descripcion!: string;

	@Column({ type: 'integer' })
	precio!: number;

	@Column({ type: 'varchar', length: 255 })
	telefono!: string;

	@Column({ type: 'float', default: 0 })
	promedio_valoracion!: number;

	@Column({ type: 'boolean', default: false })
	permitir_comentarios!: boolean;

	@Column({ type: 'enum', enum: Estado, default: Estado.ACTIVA })
	estado!: Estado;

	@Column({ type: 'varchar', length: 255 })
	direccion!: string;

	@Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
	coordenadas!: object;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	fecha_publicacion!: Date;

	@OneToMany(() => Comentario, (comentario) => comentario.publicacion)
	comentarios!: ComentarioType[];

	@OneToMany(() => Valoracion, (valoracion) => valoracion.publicacion)
	valoraciones!: ValoracionType[];

	@OneToMany(() => Reporte, (reporte) => reporte.publicacion)
	reportes!: ReporteType[];

	@ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.publicaciones)
	@JoinTable({
		name: 'publicacion_etiqueta',
		joinColumn: { name: 'id_publicacion', referencedColumnName: 'id_publicacion' },
		inverseJoinColumn: { name: 'id_etiqueta', referencedColumnName: 'id_etiqueta' },
	})
	etiquetas!: EtiquetaType[];

	@OneToMany(() => Cercania, (cercania) => cercania.publicacion)
	cercanias!: CercaniaType[];

	@OneToMany(() => Foto, (foto) => foto.publicacion)
	fotos!: FotoType[];
}
