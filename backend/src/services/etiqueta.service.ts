import { createQueryBuilder } from "typeorm";
import { AppDataSource } from "../config/db.config.js";
import { Etiqueta } from "../entities/etiqueta.entity.js";
import { Publicacion } from "../entities/publicacion.entity.js";

const etiquetaRepository = AppDataSource.getRepository(Etiqueta);
const publicacionRepository = AppDataSource.getRepository(Publicacion);

export class EtiquetaService {
    private repository = etiquetaRepository;
    
    // Método para obtener todas las etiquetas que existen, sirve para mostrarlas en el dashboard
    // principal cuando el usuario quiere aplicar filtros.
    async findAllEtiquetas() {
        return await this.repository.find();
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
}
