import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Publicacion } from './publicacion.entity.js';
import type { Publicacion as PublicacionType } from './publicacion.entity.js';

@Entity({ name: 'foto' })
export class Foto {
    @PrimaryGeneratedColumn({ name: 'id_foto', type: 'int' })
    id_foto!: number;

    @ManyToOne(() => Publicacion, (publicacion) => publicacion.fotos, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion!: PublicacionType;

    @Column({ name: 'url_foto', type: 'varchar', length: 255 })
    url_foto!: string;

    @Column({ name: 'es_portada', type: 'boolean', default: false})
    es_portada!: boolean;
}