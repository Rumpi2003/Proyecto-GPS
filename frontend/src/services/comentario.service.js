import api from "./axios.config.js";

export async function crearComentario(id_publicacion, texto) {
  const res = await api.post("/comentarios", { id_publicacion, texto });
  return res.data.data;
}