import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Publicacion } from './publicacion.entity.js';
import { Comentario } from './comentario.entity.js';

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

  @Column({ type: 'varchar', length: 50 })
  rol!: string;

  @OneToMany(() => Publicacion, (publicacion) => publicacion.publicante)
  publicaciones!: Publicacion[];

  @OneToMany(() => Comentario, (comentario) => comentario.usuario)
  comentarios!: Comentario[];
}