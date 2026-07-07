import api from './axios.config';

export async function getPublicacionesFiltradas(params) {
    const res = await api.get('/publicaciones/filtros', { params });
    return res.data.data;
}

export async function createPublicacion(formData) {
    const res = await api.post('/publicaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
}
