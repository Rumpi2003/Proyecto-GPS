import { AppDataSource } from "../config/db.config.js";
import { geocodingService } from "../services/geocoding.service.js";
import { Universidad } from "../entities/universidad.entity.js";

const universidadRepo = AppDataSource.getRepository(Universidad);

export async function distanciaMinima(placeId: string) {
    const maxDistance = 2000; // 2km en metros

    const { lat, lng, formattedAddress, coordenadas } = await geocodingService.geocodePlaceId(placeId);

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
        direccion: formattedAddress,
        coordenadas,
    }));
}