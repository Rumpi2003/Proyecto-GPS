import { AppDataSource } from "../config/db.config.js";
import { Publicacion } from "../entities/publicacion.entity.js"
import { ILike } from "typeorm";

const publicacionRepo = AppDataSource.getRepository(Publicacion);

export async function direccionExiste(direccion: string) {
    const direccionNormalizada = direccion.trim();

    if (!direccionNormalizada) {
        return false;
    }

    const existente = await publicacionRepo.findOne({
        where: { direccion: ILike(direccionNormalizada) },
    });
    
    return !!existente;
}