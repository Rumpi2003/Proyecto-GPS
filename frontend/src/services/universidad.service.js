import api from './axios.config';

export async function getUniversidades() {
    const res = await api.get('/universidades');
    return res.data.data;
}

export async function getUniversidadById(id_universidad) {
    const res = await api.get(`/universidades/${id_universidad}`);
    return res.data.data;
}