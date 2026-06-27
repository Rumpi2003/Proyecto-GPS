import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Formato de la dirección es: [calle] [numero], [comuna], [región], [pais]
// Dado que el alcance del proyecto solo se extiende a universidades de concepción
// el [país] y la [region] siempre serán Chile y Bio Bio, por lo que el usuario
// solo tendrá que ingresar la  [comuna], [calle] y [numero]

export class GeocodingService {
    async geocodePlaceId(placeId: string) {
        const apiKey = process.env.GOOGLE_GEOCODE_API_KEY;
        if (!apiKey) {
            throw new Error('Falta GOOGLE_MAPS_API_KEY en las variables de entorno');
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}`;

        const resultado = await axios.get(url);

        if (resultado.status !== 200) {
            throw new Error(`Error en la API de Geocoding de Google: ${resultado.statusText}`)
        }

        const data = resultado.data;

        if (data.status !== 'OK' || !data.results?.length) {
            throw new Error(`No se encontró el place_id: ${placeId}`);
        }

        const ubicacion = data.results[0];

        return {
            placeId,
            formattedAddress: ubicacion.formatted_address,
            lat: ubicacion.geometry.location.lat,
            lng: ubicacion.geometry.location.lng,
            coordenadas: {
                type: 'Point',
                coordinates: [ubicacion.geometry.location.lng, ubicacion.geometry.location.lat],
            },
        };
    }
}

export const geocodingService = new GeocodingService();
