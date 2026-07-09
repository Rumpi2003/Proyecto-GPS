import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";
import api from "../services/axios.config.js";

const getConteosAdmin = async () => {
  const [solicitudesRes, reportesPubliRes, reportesComRes] = await Promise.all([
    api.get("/publicaciones/pendientes"),
    api.get("/reportes-publicaciones"),
    api.get("/reportes-comentarios"),
  ]);

  return {
    solicitudesPublicacion: solicitudesRes.data.data?.length ?? 0,
    reportesPublicacion: reportesPubliRes.data.data?.length ?? 0,
    reportesComentario: reportesComRes.data.data?.length ?? 0,
  };
};

export default function HomeAdmin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [conteos, setConteos] = useState({
    solicitudesPublicacion: 0,
    reportesPublicacion: 0,
    reportesComentario: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const data = await getConteosAdmin();
        setConteos(data);
      } catch (error) {
        console.error("Error al cargar los conteos del panel:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const BadgeConteo = ({ cantidad }) => (
    <div className="bg-danger-low border border-danger/30 text-danger-hover px-4 md:px-6 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium tracking-wide shrink-0">
      {cargando ? "..." : `${cantidad} nuevos`}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header: Adaptado al ancho máximo del Home */}
      <header className="bg-ustay-blue w-full shadow-sm">
        <div className="max-w-[1440px] mx-auto w-full px-6 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-2xl font-poppins italic">U-STAY</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-full transition-all cursor-pointer font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal: Usando la misma grilla y padding del Home */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col flex-grow pb-16">
        
        {/* Panel Blanco con los mismos bordes y sombras del Home */}
        <div className="bg-white rounded-panel shadow-soft p-6 md:p-10 flex flex-col gap-8 border border-slate-100 flex-grow">
          
          {/* Textos usando EXCLUSIVAMENTE tus variables predefinidas */}
          <div className="space-y-3">
            <h1 className="titulo">
              Bienvenido {user?.nombre || "Administrador"}
            </h1>
            <h2 className="subtitulo">
              Todo lo que necesitas para comenzar a operar
            </h2>
            <p className="texto max-w-2xl">
              En U-Stay, tu compromiso con nuestro trabajo es importante, controla y gestiona publicaciones y comentarios para mantener limpio nuestro sistema.
            </p>
          </div>

          {/* Lista descriptiva con los íconos del Home (bg-ustay-bg rounded-xl) */}
          <div className="space-y-6 my-4">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-10 md:h-10 p-3 md:p-2.5 bg-ustay-bg rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-full h-full text-ustay-text" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-4h16v4zm0-8H4V6h16v4z"/><circle cx="8" cy="16" r="2"/></svg>
              </div>
              <p className="texto max-w-2xl">Revisa y aprueba las solicitudes de publicaciones en nuestro sistema</p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-10 md:h-10 p-3 md:p-2.5 bg-ustay-bg rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-full h-full text-ustay-text" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              </div>
              <p className="texto max-w-2xl">Analiza los reportes a las publicaciones para mantener un entorno seguro y respetuoso.</p>
            </div>

            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-10 md:h-10 p-3 md:p-2.5 bg-ustay-bg rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-full h-full text-ustay-text" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
              </div>
              <p className="texto max-w-2xl">Lee los reportes a los comentarios y elimínalos en base a su carácter.</p>
            </div>
          </div>

          {/* Botones de Tareas */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ustay-muted font-poppins">
              Para comenzar, selecciona una tarea:
            </p>
            
            <div className="grid grid-cols-1 gap-3 md:gap-5">
              <button 
                onClick={() => navigate('/admin/solicitudes')}
                className="flex flex-col md:flex-row md:items-center md:justify-between w-full p-4 md:p-6 bg-transparent border border-ustay-blue/30 rounded-ustay-card hover:bg-ustay-card hover:shadow-soft transition-all duration-300 ease-in-out cursor-pointer group gap-3 md:gap-0"
              >
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="text-ustay-text">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  </div>
                  <span className="subtitulo text-sm md:text-base">Solicitud de publicaciones</span>
                </div>
                <BadgeConteo cantidad={conteos.solicitudesPublicacion} />
              </button>

              <button 
                onClick={() => navigate('/admin/reportes-publicaciones')}
                className="flex flex-col md:flex-row md:items-center md:justify-between w-full p-4 md:p-6 bg-transparent border border-ustay-blue/30 rounded-ustay-card hover:bg-ustay-card hover:shadow-soft transition-all duration-300 ease-in-out cursor-pointer group gap-3 md:gap-0"
              >
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="text-ustay-text">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                  </div>
                  <span className="subtitulo text-sm md:text-base">Reporte a publicaciones</span>
                </div>
                <BadgeConteo cantidad={conteos.reportesPublicacion} />
              </button>

              <button 
                onClick={() => navigate('/admin/reportes-comentarios')}
                className="flex flex-col md:flex-row md:items-center md:justify-between w-full p-4 md:p-6 bg-transparent border border-ustay-blue/30 rounded-ustay-card hover:bg-ustay-card hover:shadow-soft transition-all duration-300 ease-in-out cursor-pointer group gap-3 md:gap-0"
              >
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="text-ustay-text">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
                  </div>
                  <span className="subtitulo text-sm md:text-base">Reporte a comentarios</span>
                </div>
                <BadgeConteo cantidad={conteos.reportesComentario} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <BarraInferior />
    </div>
  );
}