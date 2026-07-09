import api from "./axios.config.js";

export async function crearReporte(id_publicacion, motivo, detalle = "") {
    const body = {
        id_publicacion,
        motivo,
        detalle: detalle?.trim() || null,
    };

    const res = await api.post("/reportes", body);
    return res.data.data;
}