import { AppDataSource } from '../config/db.config.js';
import { Universidad } from '../entities/universidad.entity.js';

const universidadRepository = AppDataSource.getRepository(Universidad);

export class UniversidadService {
    private repository = universidadRepository;

    async create(data: Partial<Universidad>) {
        const universidad = this.repository.create(data);
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