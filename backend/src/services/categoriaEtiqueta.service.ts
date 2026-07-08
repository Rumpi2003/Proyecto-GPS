import { AppDataSource } from '../config/db.config.js';
import { CategoriaEtiqueta } from '../entities/categoriaEtiqueta.entity.js';

const categoriaEtiquetaRepository = AppDataSource.getRepository(CategoriaEtiqueta);

export class CategoriaEtiquetaService {
    private repository = categoriaEtiquetaRepository;

    async create(data: Partial<CategoriaEtiqueta>) {
        const nombre = String(data.nombre_categoria ?? "").trim();
        const es_excluyente = Boolean(data.es_excluyente ?? false);

        if (!nombre) {
            throw new Error('El nombre de la categoría es obligatorio');
        }

        const existente = await this.repository.findOne({
            where: { nombre_categoria: nombre },
        });

        if (existente) {
            console.log(`Categoría ${nombre} ya existe`);
            return existente;
        }

        const categoria = this.repository.create({
            nombre_categoria: nombre,
            es_excluyente,
        });

        console.log(`Categoría ${nombre} creada`);
        return this.repository.save(categoria);
    }

    async findAll() {
        return this.repository.find({
            relations: ['etiquetas'],
        });
    }
}