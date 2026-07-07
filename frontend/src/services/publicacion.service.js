import api from './axios.config';

export async function getPublicacionesFiltradas(params) {
    const res = await api.get('/publicaciones/filtros', { params });
    return res.data.data;
}

export async function getPublicacionById(id_publicacion) {
    const res = await api.get(`/publicaciones/${id_publicacion}`);
    return res.data.data;
}