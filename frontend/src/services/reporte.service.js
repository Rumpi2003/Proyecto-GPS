import api from "./axios.config.js";

export async function crearReporte(id_publicacion, motivo, detalle = "") {
    const body = {
        id_publicacion,
        motivo,
        detalle: detalle?.trim() || null,
    };

    const res = await api.post("/reportes-publicaciones", body);
    return res.data.data;
}
