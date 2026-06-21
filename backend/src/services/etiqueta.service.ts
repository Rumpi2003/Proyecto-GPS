import { AppDataSource } from "../config/db.config.js";
import { Etiqueta } from "../entities/etiqueta.entity.js";

const etiquetaRepository = AppDataSource.getRepository(Etiqueta);

export class EtiquetaService {
    private repository = etiquetaRepository;
    
    async findAllEtiquetas() {
    return await this.repository.find();
    }
}
