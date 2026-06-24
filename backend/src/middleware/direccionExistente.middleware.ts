import { AppDataSource } from "../config/db.config.js";
import { Publicacion } from "../entities/publicacion.entity.js"

const publicacionRepo = AppDataSource.getRepository(Publicacion);

export async function direccionExiste(comuna: string, calle: string, numero: number) {
    const existente = await publicacionRepo.findOneBy({ comuna, calle, numero });
    return !!existente;
}