import axios from 'axios';

const MAPS_API_URL = import.meta.env.VITE_MAPS_API_URL;

export const mapsClient = axios.create({
    baseURL: MAPS_API_URL,
    timeout: 10000,
})