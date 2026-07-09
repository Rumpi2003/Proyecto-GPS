import { useState } from "react";
import banderaSvg from "../assets/iconos/bandera.svg?raw";
import { crearReporteComentario } from "../services/reporte.service.js";

const MOTIVOS = [
  { value: "spam o publicidad", label: "Spam o publicidad" },
  { value: "lenguaje ofensivo", label: "Lenguaje ofensivo" },
  { value: "acoso o bullying", label: "Acoso o bullying" },
];

function formatearFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IconBandera({ className }) {
  const html = banderaSvg
    .replace(/^.*?(<svg)/i, "$1")
    .replace(/<svg/i, '<svg fill="currentColor"')
    .replace(/width="[^"]*"/, 'width="14"')
    .replace(/height="[^"]*"/, 'height="14"');
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ModalReporteComentario({ isOpen, comentario, onClose, onReportado }) {
  const [motivo, setMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setMotivo("");
    setDetalle("");
    setError("");
    setEnviando(false);
  }

  if (!isOpen || !comentario) return null;

  async function handleReportar(e) {
    e.preventDefault();
    setError("");

    if (!motivo) {
      setError("Debe seleccionar un motivo");
      return;
    }

    setEnviando(true);
    try {
      await crearReporteComentario(comentario.id_comentario, motivo, detalle);
      onReportado?.(comentario);
      resetForm();
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      const msg = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || err.message || "Error al reportar el comentario";
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-panel p-6 md:p-8 max-w-lg w-full mx-4 border border-ustay-light-border shadow-xl space-y-5"
      >
        {/* Título */}
        <h2 className="titulo text-type-title">Reportar Comentario</h2>

        {/* Tarjeta del comentario */}
        <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-type-subtitle font-poppins">
              {comentario.usuario?.nombre || "Usuario"}
            </span>
            <span className="text-[11px] text-ustay-muted font-poppins shrink-0">
              {formatearFecha(comentario.fecha_comentario)}
            </span>
          </div>
          <p className="texto text-sm text-type-body leading-relaxed">
            {comentario.texto}
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="subtitulo text-sm !text-type-subtitle block">
              Motivo <span className="text-danger">*</span>
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-[#B6D5FE] rounded-[25px] px-4 py-2.5 font-['Poppins'] text-base text-ustay-text bg-white focus:outline-none focus:ring-2 focus:ring-ustay-blue/30 focus:border-ustay-blue transition-all"
              required
            >
              <option value="">Seleccione un motivo</option>
              {MOTIVOS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Detalle */}
          <div className="space-y-1.5">
            <label className="subtitulo text-sm !text-type-subtitle block">
              Descripción del reporte
            </label>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Explique brevemente por qué reporta este comentario..."
              maxLength={255}
              rows={3}
              className="w-full border border-[#B6D5FE] rounded-[18px] px-4 py-2.5 font-['Poppins'] text-base text-ustay-text bg-white resize-none focus:outline-none focus:ring-2 focus:ring-ustay-blue/30 focus:border-ustay-blue transition-all"
            />
            <p className="text-[11px] text-ustay-muted text-right">
              {detalle.length}/255
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-danger-low border border-danger/30 rounded-ustay-card p-3">
              <p className="text-xs text-danger font-medium">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={enviando}
              className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-600 font-semibold texto text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleReportar}
              disabled={enviando}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-delete text-delete bg-delete-bg hover:bg-delete-bg-hover font-semibold texto text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <IconBandera className="w-4 h-4 shrink-0 flex items-center justify-center" />
              {enviando ? "Reportando..." : "Reportar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
