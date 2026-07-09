import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarraInferior } from "../components/BarraInferior.jsx";
import api from "../services/axios.config.js";

export default function ReportePublicaciones() {
  const navigate = useNavigate();

  const [reportes, setReportes] = useState([]);
  const [reporteActivo, setReporteActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      const response = await api.get("/reportes-publicaciones");
      const data = response.data.data ?? [];
      setReportes(data);
      setReporteActivo(data[0] ?? null);
    } catch (error) {
      console.error("Error al cargar reportes de publicaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const manejarAccion = async (id_reporte, nuevoEstado) => {
    try {
      setProcesando(true);
      await api.patch(`/reportes-publicaciones/${id_reporte}/evaluar`, { estado: nuevoEstado });
      await cargarReportes();
    } catch (error) {
      console.error("Error al evaluar el reporte:", error);
      alert("No se pudo procesar el reporte");
    } finally {
      setProcesando(false);
    }
  };

  // Lógica para contar la frecuencia de las IPs dinámicamente
  const conteoIps = useMemo(() => {
    const conteos = {};
    reportes.forEach((reporte) => {
      conteos[reporte.ip_reporte] = (conteos[reporte.ip_reporte] || 0) + 1;
    });
    return conteos;
  }, [reportes]);

  // Verificamos si la IP del reporte seleccionado aparece 2 o más veces
  const esIpSospechosa = reporteActivo ? conteoIps[reporteActivo.ip_reporte] >= 2 : false;

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
        
        {/* Barra superior de navegación */}
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
            Solicitudes de reportes a publicaciones
          </h1>
        </div>

        {/* Grilla principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: Lista de Reportes */}
          <div className="lg:col-span-5 bg-white rounded-panel shadow-soft p-4 border border-slate-100 flex flex-col gap-3 h-[600px] overflow-y-auto">
            {cargando ? (
              <p className="texto text-ustay-muted text-center py-10">Cargando reportes...</p>
            ) : reportes.length === 0 ? (
              <p className="texto text-ustay-muted text-center py-10">No hay reportes pendientes.</p>
            ) : (
              reportes.map((reporte) => {
                const isActive = reporteActivo?.id_reporte === reporte.id_reporte;

                return (
                  <div 
                    key={reporte.id_reporte}
                    onMouseEnter={() => setReporteActivo(reporte)}
                    className={`p-5 rounded-ustay-card cursor-pointer transition-all duration-200 border ${
                      isActive 
                        ? "bg-blue-100 border-blue-200" 
                        : "bg-white border-slate-200 hover:border-ustay-blue/30"
                    }`}
                  >
                    <h3 className="subtitulo !text-lg text-ustay-text">{reporte.publicacion?.titulo ?? "Publicación eliminada"}</h3>
                    <p className="texto text-sm text-ustay-muted">#{reporte.ip_reporte}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* COLUMNA DERECHA: Detalles del Reporte Activo */}
          <div className="lg:col-span-7 bg-white rounded-panel shadow-soft p-8 border border-slate-100 flex flex-col gap-6 relative min-h-[600px]">
            {reporteActivo ? (
              <>
                <div className="space-y-2">
                  <label className="subtitulo !text-base text-ustay-text">Motivo del reporte:</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4 min-h-[100px]">
                    <p className="texto text-ustay-muted text-sm capitalize">{reporteActivo.motivo}</p>
                    {reporteActivo.detalle && (
                      <p className="texto text-ustay-muted text-sm mt-2">{reporteActivo.detalle}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="subtitulo !text-base text-ustay-text">Descripción de la publicación</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4 min-h-[100px]">
                    <p className="texto text-ustay-muted text-sm">{reporteActivo.publicacion?.descripcion ?? "Publicación no disponible"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="subtitulo !text-base text-ustay-text">Datos de auditoría</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4 text-sm text-ustay-muted space-y-1">
                    <p>IP: {reporteActivo.ip_reporte}</p>
                    <p className="break-all">User-Agent: {reporteActivo.user_agent}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-0 rounded-xl overflow-hidden border border-slate-200 w-fit self-end shadow-sm">
                  <button
                    onClick={() => manejarAccion(reporteActivo.id_reporte, "desestimado")}
                    disabled={procesando}
                    title="Desestimar reporte (mantener publicación)"
                    className="bg-green-100 hover:bg-green-200 text-green-600 px-6 py-3 transition-colors cursor-pointer border-r border-slate-200 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button
                    onClick={() => manejarAccion(reporteActivo.id_reporte, "confirmado")}
                    disabled={procesando}
                    title="Confirmar reporte"
                    className="bg-red-100 hover:bg-red-200 text-red-500 px-6 py-3 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </>
            ) : (
              <p className="texto text-ustay-muted text-center py-20">Selecciona un reporte para ver el detalle</p>
            )}
          </div>
        </div>

        {/* Alerta flotante dinámica evaluada con esIpSospechosa */}
        {esIpSospechosa && (
          <div className="absolute bottom-10 right-10 bg-slate-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-lg animate-fade-in">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-poppins text-sm font-medium">La IP {reporteActivo.ip_reporte} es sospechosa...</span>
          </div>
        )}
        
      </main>

      <BarraInferior />
    </div>
  );
}