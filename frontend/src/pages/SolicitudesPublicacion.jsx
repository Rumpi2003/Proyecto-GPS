import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarraInferior } from "../components/BarraInferior.jsx";
import api from "../services/axios.config.js"; // Asegúrate de tener tu instancia de axios configurada

export default function SolicitudesPublicacion() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Función para cargar las publicaciones en espera desde tu backend
  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      const response = await api.get("/publicaciones/pendientes");
      const data = response.data.data ?? [];
      setPublicaciones(data);
      setSeleccionada(data[0] ?? null);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  // Función para cambiar el estado (Aceptar o Rechazar)
  const manejarAccion = async (id, nuevoEstado) => {
    try {
      setProcesando(true);
      await api.patch(`/publicaciones/${id}/estado`, { estado: nuevoEstado });
      // Recargamos la lista tras el éxito
      await cargarPublicaciones();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo procesar la solicitud");
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
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col flex-grow pb-16">

        {/* Barra superior de navegación */}
        <div className="bg-white rounded-full px-6 py-4 mb-6 shadow-sm flex items-center gap-4 w-full border border-slate-100">
          <button
            onClick={() => navigate('/admin')}
            className="text-ustay-blue hover:text-ustay-blue-dark transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="subtitulo text-ustay-blue !font-medium">
            Solicitudes de publicaciones
          </h1>
        </div>

        {/* Grilla principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COLUMNA IZQUIERDA: Lista */}
          <div className="lg:col-span-5 bg-white rounded-panel shadow-soft p-4 border border-slate-100 flex flex-col gap-3 h-[600px] overflow-y-auto">
            {cargando ? (
              <p className="texto text-ustay-muted text-center py-10">Cargando publicaciones...</p>
            ) : publicaciones.length === 0 ? (
              <p className="texto text-ustay-muted text-center py-10">No hay publicaciones pendientes.</p>
            ) : (
              publicaciones.map((pub) => {
                const isActive = seleccionada?.id_publicacion === pub.id_publicacion;

                return (
                  <div
                    key={pub.id_publicacion}
                    onMouseEnter={() => setSeleccionada(pub)}
                    className={`p-5 rounded-ustay-card cursor-pointer transition-all duration-200 border ${
                      isActive
                        ? "bg-blue-100 border-blue-200"
                        : "bg-white border-slate-200 hover:border-ustay-blue/30"
                    }`}
                  >
                    <h3 className="subtitulo !text-lg text-ustay-text">{pub.titulo}</h3>
                    <p className="texto text-sm text-ustay-muted">
                      Solicitado por: {pub.publicante?.nombre ?? "Desconocido"}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* COLUMNA DERECHA: Detalle */}
          <div className="lg:col-span-7 bg-white rounded-panel shadow-soft p-8 border border-slate-100 flex flex-col gap-6 relative min-h-[600px]">
            {seleccionada ? (
              <>
                <h3 className="titulo !text-2xl">{seleccionada.titulo}</h3>

                <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ustay-blue/10 text-ustay-blue font-bold flex items-center justify-center">
                    {(seleccionada.publicante?.nombre ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="subtitulo !text-base !font-medium text-ustay-text">
                      {seleccionada.publicante?.nombre ?? "Usuario desconocido"}
                    </p>
                    <p className="texto text-sm text-ustay-muted">
                      {seleccionada.publicante?.correo ?? "Sin correo"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="subtitulo !text-base text-ustay-text">Dirección:</label>
                  <p className="texto text-ustay-muted text-sm">{seleccionada.direccion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="subtitulo !text-base text-ustay-text">Precio:</label>
                    <p className="texto text-ustay-muted text-sm">
                      ${seleccionada.precio?.toLocaleString?.("es-CL") ?? seleccionada.precio}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="subtitulo !text-base text-ustay-text">Teléfono:</label>
                    <p className="texto text-ustay-muted text-sm">{seleccionada.telefono}</p>
                  </div>
                </div>

                {(() => {
                  const portada = seleccionada.fotos?.find((f) => f.es_portada) ?? seleccionada.fotos?.[0];
                  return portada ? (
                    <img
                      src={portada.url_foto}
                      alt="Portada de la publicación"
                      className="h-40 w-full object-cover rounded-ustay-card"
                    />
                  ) : (
                    <div className="h-40 bg-slate-200 rounded-ustay-card flex items-center justify-center texto text-ustay-muted">
                      Sin imagen
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <label className="subtitulo !text-base text-ustay-text">Descripción:</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-ustay-card p-4">
                    <p className="texto text-ustay-muted text-sm">{seleccionada.descripcion}</p>
                  </div>
                </div>

                {seleccionada.etiquetas?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {seleccionada.etiquetas.map((et) => (
                      <span
                        key={et.id_etiqueta}
                        className="text-xs font-poppins bg-ustay-blue/10 text-ustay-blue border border-ustay-blue/20 px-3 py-1 rounded-full"
                      >
                        {et.nombreEtiqueta}
                      </span>
                    ))}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end gap-0 rounded-xl overflow-hidden border border-slate-200 w-fit self-end shadow-sm mt-2">
                  <button
                    onClick={() => manejarAccion(seleccionada.id_publicacion, 'activa')}
                    disabled={procesando}
                    title="Aceptar solicitud"
                    className="bg-green-100 hover:bg-green-200 text-green-600 px-6 py-3 transition-colors cursor-pointer border-r border-slate-200 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button
                    onClick={() => manejarAccion(seleccionada.id_publicacion, 'rechazada')}
                    disabled={procesando}
                    title="Rechazar solicitud"
                    className="bg-red-100 hover:bg-red-200 text-red-500 px-6 py-3 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </>
            ) : (
              <p className="texto text-ustay-muted text-center py-20">Selecciona una publicación para gestionar</p>
            )}
          </div>
        </div>
      </main>

      <BarraInferior />
    </div>
  );
}
