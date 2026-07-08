import api from './axios.config';

export async function getComentariosByPublicacion(id_publicacion) {
    const res = await api.get(`/comentarios/publicacion/${id_publicacion}`);
    return res.data.data; // Array de comentarios con usuario
}

export async function crearComentario(id_publicacion, texto) {
  const res = await api.post("/comentarios", { id_publicacion, texto });
  return res.data.data;
}
