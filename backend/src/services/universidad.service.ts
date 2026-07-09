import { AppDataSource } from '../config/db.config.js';
import { Universidad } from '../entities/universidad.entity.js';

const universidadRepository = AppDataSource.getRepository(Universidad);

export class UniversidadService {
    private repository = universidadRepository;

    async create(data: Partial<Universidad>) {
        const nombre = String(data.nombre_universidad ?? '').trim();
        const direccion = String(data.direccion ?? '').trim();

        if (!nombre) {
            throw new Error('El nombre de la universidad es obligatorio');
        }

        if (!direccion) {
            throw new Error('La dirección de la Universidad es obligatoria');
        }

        const existente = await this.repository.findOne({
            where: { nombre_universidad: nombre },
        });

        if (existente) {
            console.log(`${nombre} ya existe`);
            return existente;
        }

        const universidadData: Partial<Universidad> = {
            nombre_universidad: nombre,
            direccion,
        };

        if (data.coordenadas !== undefined) {
            universidadData.coordenadas = data.coordenadas;
        }

        const universidad = this.repository.create(universidadData);

        console.log(`${nombre} creada`);
        return this.repository.save(universidad);
    }
    
    async findAll() {
        return this.repository.find();
    }

    async findOne(id_universidad: number) {
        return this.repository.findOneBy({ id_universidad });
    }

    async update(id_universidad: number, data: Partial<Universidad>) {
        await this.repository.update(id_universidad, data);
        return this.findOne(id_universidad);
    }

    async delete(id_universidad: number) {
        return this.repository.delete(id_universidad);
    }
}