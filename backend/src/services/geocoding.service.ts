import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Formato de la dirección es: [calle] [numero], [comuna], [región], [pais]
// Dado que el alcance del proyecto solo se extiende a universidades de concepción
// el [país] y la [region] siempre serán Chile y Bio Bio, por lo que el usuario
// solo tendrá que ingresar la  [comuna], [calle] y [numero]

export class GeocodingService {
    async geocodeAddress(direccion: string) {
        const apiKey = process.env.GOOGLE_GEOCODE_API_KEY;
        if (!apiKey) {
            throw new Error('Falta GOOGLE_MAPS_API_KEY en las variables de entorno');
        }

        const url = `${GOOGLE_GEOCODE_URL}?address=${encodeURIComponent(direccion)}&key=${apiKey}`;
        const resultado = await axios.get(url);

        if (resultado.status !== 200) {
            throw new Error(`Error en la API de Geocoding de Google: ${resultado.statusText}`)
        }

        const data = resultado.data;

        if (data.status !== 'OK') {
            throw new Error(data.error_message || data.status);
        } else if (!data.results?.length) {
            throw new Error(`No se encontraron coordenadas para la dirección: ${direccion}`);
        }

        return {
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng,
            formattedAddress: data.results[0].formatted_address,
        }
    }
}

export const geocodingService = new GeocodingService();
