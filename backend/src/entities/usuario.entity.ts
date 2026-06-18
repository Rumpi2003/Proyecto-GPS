import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}