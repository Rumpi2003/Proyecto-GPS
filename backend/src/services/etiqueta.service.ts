import { AppDataSource } from "../config/db.config.js";
import { Etiqueta } from "../entities/etiqueta.entity.js";
import { CategoriaEtiqueta } from "../entities/categoriaEtiqueta.entity.js";
import { Publicacion } from "../entities/publicacion.entity.js";
import { In } from "typeorm"; 

const etiquetaRepository = AppDataSource.getRepository(Etiqueta);
const categoriaEtiquetaRepository = AppDataSource.getRepository(CategoriaEtiqueta);
const publicacionRepository = AppDataSource.getRepository(Publicacion);

export class EtiquetaService {
    private repository = etiquetaRepository;

    async createEtiqueta(data: {
        nombreEtiqueta: string;
        url_icono: string;
        id_categoria: number;
    }) {
        const nombreEtiqueta = String(data.nombreEtiqueta ?? "").trim();
        const url_icono = String(data.url_icono ?? "").trim();
        const id_categoria = Number(data.id_categoria);

        if (!nombreEtiqueta) {
            throw new Error("El nombre de la etiqueta es obligatorio");
        }

        if (!url_icono) {
            throw new Error("La URL del ícono es obligatoria");
        }

        if (Number.isNaN(id_categoria) || id_categoria <= 0) {
            throw new Error("El ID de la categoría es inválido");
        }

        const categoria = await categoriaEtiquetaRepository.findOneBy({ id_categoria });
        if (!categoria) {
            throw new Error("La categoría especificada no existe");
        }

        const etiquetaExistente = await this.repository.findOne({
            where: {
                nombreEtiqueta,
                categoria: { id_categoria },
            },
            relations: ["categoria"],
        });

        if (etiquetaExistente) {
            console.log(`Etiqueta ${nombreEtiqueta} ya existe en la categoría ${categoria.nombre_categoria}`);
            return etiquetaExistente;
        }

        const etiqueta = this.repository.create({
            nombreEtiqueta,
            url_icono,
            categoria,
        });

        await this.repository.save(etiqueta);


        console.log(`Etiqueta ${nombreEtiqueta} creada en la categoría ${categoria.nombre_categoria}`);
        return this.repository.findOne({
            where: { id_etiqueta: etiqueta.id_etiqueta },
            relations: ["categoria"],   
        });
    }
    
    // Método para obtener todas las etiquetas que existen, sirve para mostrarlas en el dashboard
    // principal cuando el usuario quiere aplicar filtros.
    async findAllEtiquetas() {
        return await this.repository.find();
    }

    async findAllEtiquetasConCategoria() {
        return this.repository.find({
            relations: ["categoria"],
        });
    }

    // Métodos para añadir y eliminar etiquetas de una publicación, sirve para que el usuario publicador
    // pueda manejar las etiquetas de sus publicaciones.
    async addEtiqueta(id_publicacion: number, id_etiqueta: number) {
        const etiqueta = await this.repository.findOneBy({ id_etiqueta });
        if (!etiqueta) throw new Error('Etiqueta no encontrada');

        await publicacionRepository
            .createQueryBuilder()
            .relation(Publicacion, 'etiquetas')
            .of(id_publicacion)
            .add(id_etiqueta);

        return publicacionRepository.findOne({
            where: { id_publicacion },
            relations: ['etiquetas'],
        }); 
    }
    
    async removeEtiqueta(id_publicacion: number, id_etiqueta: number) {
        await publicacionRepository
            .createQueryBuilder()
            .relation(Publicacion, 'etiquetas')
            .of(id_publicacion)
            .remove(id_etiqueta);

        return publicacionRepository.findOne({
            where: { id_publicacion },
            relations: ['etiquetas'],
        });
    }

    async validarEtiquetasNoExcluyentes(idsEtiquetas: number[]) {
        const idsUnicos = [...new Set(idsEtiquetas.filter((id) => Number.isInteger(id) && id > 0))];

        if (idsUnicos.length <= 1) return;

        const etiquetas = await this.repository.find({
            where: { id_etiqueta: In(idsUnicos) },
            relations: ["categoria"],
        });

        if (etiquetas.length !== idsUnicos.length) {
            throw new Error("Una o más etiquetas no existen");
        }

        const categoriasExcluyentes = new Map<number, { nombre: string; etiquetas: string[] }>();

        for (const etiqueta of etiquetas) {
            const categoria = etiqueta.categoria;
            if (!categoria || !categoria.es_excluyente) continue;

            const actual = categoriasExcluyentes.get(categoria.id_categoria) ?? {
                nombre: categoria.nombre_categoria,
                etiquetas: [],
            };

            actual.etiquetas.push(etiqueta.nombreEtiqueta);
            categoriasExcluyentes.set(categoria.id_categoria, actual);
        }

        const conflictos = [...categoriasExcluyentes.values()]
            .filter((c) => c.etiquetas.length > 1)
            .map(
                (c) =>
                    `Categoría "${c.nombre}" contiene etiquetas excluyentes: ${c.etiquetas.join(", ")}`
            );

        if (conflictos.length > 0) {
            throw new Error(`Conflicto de etiquetas excluyentes. ${conflictos.join(" | ")}`);
        }
    }
}
