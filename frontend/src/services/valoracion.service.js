import api from "./axios.config.js";

export async function crearValoracion(id_publicacion, puntuacion) {
    const res = await api.post("/valoraciones", { id_publicacion, puntuacion,});
    return res.data.data;
}