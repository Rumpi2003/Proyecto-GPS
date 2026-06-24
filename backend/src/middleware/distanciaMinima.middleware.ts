import { AppDataSource } from "../config/db.config.js";
import { geocodingService } from "../services/geocoding.service.js";
import { Universidad } from "../entities/universidad.entity.js";

const universidadRepo = AppDataSource.getRepository(Universidad);

export async function distanciaMinima(direccion: string) {
    const maxDistance = 3000
    const { lat, lng } = await geocodingService.geocodeAddress(direccion);
    const point = `SRID=4326;POINT(${lng} ${lat})`;

    const { entities, raw } = await universidadRepo
        .createQueryBuilder('uni')
        .addSelect(
            'ST_Distance(uni.coordenadas, ST_GeogFromText(:point))',
            'distancia_metros',
        )
        .where(
            'ST_DWithin(uni.coordenadas, ST_GeogFromText(:point), :maxDistance)',
            { point, maxDistance}
        )
        .setParameters({ point, maxDistance})
        .getRawAndEntities();

    return entities.map((uni, index) => ({
        universidad: uni,
        distancia_metros: Number(raw[index].distancia_metros),
    }));
}