import api from './axios.config';

export async function getPublicacionesFiltradas(params) {
    const res = await api.get('/publicaciones/filtros', { params });
    return res.data.data;
}