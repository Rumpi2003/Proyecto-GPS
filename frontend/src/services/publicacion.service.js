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

export async function getMisPublicaciones(id_usuario) {
    const res = await api.get(`/publicaciones/usuario/${id_usuario}`);
    return res.data.data;
}

export async function toggleEstado(id_publicacion, estado) {
    const res = await api.patch(`/publicaciones/${id_publicacion}/estado`, { estado });
    return res.data.data;
}

export async function eliminarPublicacion(id_publicacion) {
    const res = await api.delete(`/publicaciones/${id_publicacion}`);
    return res.data.data;
}

export async function getPublicacionById(id_publicacion) {
    const res = await api.get(`/publicaciones/${id_publicacion}`);
    return res.data.data;
}

export async function updatePublicacion(id_publicacion, formData) {
    const res = await api.put(`/publicaciones/${id_publicacion}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
}
