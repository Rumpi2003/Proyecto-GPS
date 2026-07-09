import api from "./axios.config.js";

export async function obtenerMisReportesComentarios(ids) {
  const res = await api.get(`/reportes-comentarios/mis-reportes?ids=${ids.join(",")}`);
  return res.data.data.comentarios_reportados; // number[]
}

export async function crearReporte(id_publicacion, motivo, detalle = "") {
    const body = {
        id_publicacion,
        motivo,
        detalle: detalle?.trim() || null,
    };

    const res = await api.post("/reportes-publicaciones", body);
    return res.data.data;
}

export async function crearReporteComentario(id_comentario, motivo, detalle = "") {
    const body = {
        id_comentario,
        motivo,
        detalle: detalle?.trim() || null,
    };

    const res = await api.post("/reportes-comentarios", body);
    return res.data.data;
}
