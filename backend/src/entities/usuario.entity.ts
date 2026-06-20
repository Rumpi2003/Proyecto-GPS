import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Publicacion } from './publicacion.entity.js';
import { Comentario } from './comentario.entity.js';
import { Valoracion } from './valoracion.entity.js';
import { Reporte } from './reporte.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';
import type { Comentario as ComentarioType } from './comentario.entity.js';
import type { Valoracion as ValoracionType } from './valoracion.entity.js';
import type { Reporte as ReporteType } from './reporte.entity.js';

export enum Rol {
  REGISTRADO = 'registrado',
  PUBLICANTE = 'publicante',
  ADMINISTRADOR = 'administrador',
}

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'int' })
  id_usuario!: number;

  @Column({ type: 'varchar', length: 255 })
  correo!: string;

  @Column({ type: 'varchar', length: 255 })
  contraseña!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.REGISTRADO })
  rol!: Rol;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro!: Date;

  @OneToMany(() => Publicacion, (publicacion) => publicacion.publicante)
  publicaciones!: PublicacionType[];

  @OneToMany(() => Comentario, (comentario) => comentario.usuario)
  comentarios!: ComentarioType[];

  @OneToMany(() => Valoracion, (valoracion) => valoracion.usuario)
  valoraciones!: ValoracionType[];

  @OneToMany(() => Reporte, (reporte) => reporte.usuario)
  reportes!: ReporteType[];
}