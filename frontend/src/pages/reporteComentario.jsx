import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarraInferior } from "../components/BarraInferior.jsx";
import api from "../services/axios.config.js";

export function ReporteComentarios() {
  const navigate = useNavigate();

  const [reportes, setReportes] = useState([]);
  const [reporteActivo, setReporteActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      const response = await api.get("/reportes-comentarios");
      const data = response.data.data ?? [];
      setReportes(data);
      setReporteActivo(data[0] ?? null);
    } catch (error) {
      console.error("Error al cargar reportes de comentarios:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const manejarAccion = async (id_reporte_com, nuevoEstado) => {
    try {
      setProcesando(true);
      await api.patch(`/reportes-comentarios/${id_reporte_com}/evaluar`, { estado: nuevoEstado });
      await cargarReportes();
    } catch (error) {
      console.error("Error al evaluar el reporte:", error);
      alert("No se pudo procesar el reporte");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ustay-bg">
      
      {/* Header Clásico de U-STAY */}
      <header className="bg-ustay-blue w-full shadow-sm">
        <div className="max-w-[1440px] mx-auto w-full px-6 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-2xl font-poppins italic">U-STAY</span>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col flex-grow relative">
        
        {/* Barra superior de navegación (Volver y Título) */}
        <div className="bg-white rounded-full px-6 py-4 mb-6 shadow-sm flex items-center gap-4 w-full border border-slate-100">
          <button 
            onClick={() => navigate(-1)} 
            className="text-ustay-blue hover:text-ustay-blue-dark transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="subtitulo text-ustay-blue !font-medium">
            Solicitudes de reportes a comentarios
          </h1>
        </div>

        {/* Grilla principal de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: Lista de Reportes */}
          <div className="lg:col-span-5 bg-white rounded-panel shadow-soft p-4 border border-slate-100 flex flex-col gap-3 h-[500px] overflow-y-auto">
            {cargando ? (
              <p className="texto text-ustay-muted text-center py-10">Cargando reportes...</p>
            ) : reportes.length === 0 ? (
              <p className="texto text-ustay-muted text-center py-10">No hay reportes pendientes.</p>
            ) : (
              reportes.map((reporte) => {
                const isActive = reporteActivo?.id_reporte_com === reporte.id_reporte_com;

                return (
                  <div 
                    key={reporte.id_reporte_com}
                    onMouseEnter={() => setReporteActivo(reporte)}
                    className={`p-5 rounded-ustay-card cursor-pointer transition-all duration-200 border ${
                      isActive 
                        ? "bg-blue-100 border-blue-200" // Hover/Activo
                        : "bg-white border-slate-200 hover:border-ustay-blue/30"
                    }`}
                  >
                    <h3 className="subtitulo !text-lg text-ustay-text capitalize">{reporte.motivo}</h3>
                    <p className="texto text-sm text-ustay-muted">En: {reporte.comentario?.publicacion?.titulo ?? "Publicación eliminada"}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* COLUMNA DERECHA: Detalles del Comentario Activo */}
          <div className="lg:col-span-7 bg-white rounded-panel shadow-soft p-8 border border-slate-100 flex flex-col justify-between relative min-h-[500px]">
            {reporteActivo ? (
              <>
                <div className="space-y-8">
                  {/* Información de quién realizó el comentario */}
                  <div className="space-y-2">
                    <label className="subtitulo !text-base text-ustay-text">Autor del comentario:</label>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-ustay-card p-4">
                      {/* Avatar genérico */}
                      <div className="w-12 h-12 bg-ustay-blue/10 rounded-full flex items-center justify-center text-ustay-blue font-bold text-xl">
                        {(reporteActivo.comentario?.usuario?.nombre ?? "?").charAt(0)}
                      </div>
                      <div>
                        <p className="font-poppins font-medium text-ustay-text">{reporteActivo.comentario?.usuario?.nombre ?? "Usuario desconocido"}</p>
                        <p className="texto text-xs text-ustay-muted">IP del reporte: {reporteActivo.ip_reporte}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido del comentario reportado */}
                  <div className="space-y-2">
                    <label className="subtitulo !text-base text-ustay-text">Comentario reportado:</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-6 min-h-[120px] relative">
                      {/* Ícono de comillas decorativo */}
                      <svg className="w-8 h-8 text-slate-300 absolute top-4 left-4 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                      
                      <p className="texto text-ustay-text text-base italic pl-10 relative z-10">
                        "{reporteActivo.comentario?.texto ?? "Comentario eliminado"}"
                      </p>
                    </div>
                  </div>

                  {reporteActivo.detalle && (
                    <div className="space-y-2">
                      <label className="subtitulo !text-base text-ustay-text">Detalle del reporte:</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4">
                        <p className="texto text-ustay-muted text-sm">{reporteActivo.detalle}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fila inferior: Botones de acción (Mantener / Eliminar) */}
                <div className="flex justify-end gap-0 rounded-xl overflow-hidden border border-slate-200 w-fit self-end shadow-sm mt-8">
                  <button 
                    onClick={() => manejarAccion(reporteActivo.id_reporte_com, "desestimado")}
                    disabled={procesando}
                    title="Mantener comentario (Rechazar reporte)"
                    className="bg-green-100 hover:bg-green-200 text-green-600 px-8 py-3 transition-colors cursor-pointer border-r border-slate-200 flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Mantener
                  </button>
                  <button 
                    onClick={() => manejarAccion(reporteActivo.id_reporte_com, "confirmado")}
                    disabled={procesando}
                    title="Eliminar comentario (Confirmar reporte)"
                    className="bg-red-100 hover:bg-red-200 text-red-500 px-8 py-3 transition-colors cursor-pointer flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <p className="texto text-ustay-muted text-center py-20">Selecciona un reporte para ver el detalle</p>
            )}
          </div>
        </div>
        
      </main>

      <BarraInferior />
    </div>
  );
}