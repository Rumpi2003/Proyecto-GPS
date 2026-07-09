import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Etiqueta } from "./etiqueta.entity.js";
import type { Etiqueta as EtiquetaType } from "./etiqueta.entity.js";

@Entity({ name: 'categoria_etiqueta' })
export class CategoriaEtiqueta {
    @PrimaryGeneratedColumn({ name: 'id_categoria', type: 'int' })
    id_categoria!: number;

    @Column({ name: 'nombre_categoria', type: 'varchar', length: 255 })
    nombre_categoria!: string;

    @Column({ name: 'es_excluyente', type: 'boolean' })
    es_excluyente!: boolean;

    @OneToMany(() => Etiqueta, (etiqueta) => etiqueta.categoria)
    etiquetas!: EtiquetaType[];
}