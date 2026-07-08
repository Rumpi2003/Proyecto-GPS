import api from './axios.config';

export async function getComentariosByPublicacion(id_publicacion) {
    const res = await api.get(`/comentarios/publicacion/${id_publicacion}`);
    return res.data.data; // Array de comentarios con usuario
}
