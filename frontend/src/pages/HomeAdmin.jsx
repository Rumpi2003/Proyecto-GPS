import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BarraNavegacion } from "../components/BarraNavegacion.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";

// TODO: Reemplazar estas importaciones con tus servicios reales cuando estén listos
const getConteosAdmin = async () => {
  // Simulación de respuesta de la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        solicitudesPublicacion: 6,
        reportesPublicacion: 6,
        reportesComentario: 6,
      });
    }, 500);
  });
};

export default function HomeAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  // Función auxiliar para renderizar el badge rojo
  const BadgeConteo = ({ cantidad }) => (
    <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-1.5 rounded-full text-sm font-semibold tracking-wide">
      {cargando ? "..." : `${cantidad} nuevos`}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BarraNavegacion />

      <main className="flex-grow max-w-[1024px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-blue-50/50 p-8 md:p-12 flex flex-col gap-8">
          
          {/* Cabecera */}
          <div className="space-y-2">
            {/* Si el nombre no está en el token, muestra 'Administrador' por defecto */}
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 font-poppins">
              Bienvenido {user?.nombre || "Administrador"}
            </h1>
            <h2 className="text-xl text-slate-800 font-medium font-poppins">
              Todo lo que necesitas para comenzar a operar
            </h2>
            <p className="texto text-slate-500 max-w-3xl">
              En U-Stay, tu compromiso con nuestro trabajo es importante, controla y gestiona 
              publicaciones y comentarios para mantener limpio nuestro sistema.
            </p>
          </div>

          {/* Lista de beneficios/instrucciones */}
          <div className="space-y-4 my-2">
            <div className="flex items-center gap-4">
              <div className="text-slate-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <p className="texto text-slate-600">Revisa y aprueba las solicitudes de publicaciones en nuestro sistema</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-slate-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
              <p className="texto text-slate-600">Analiza los reportes a las publicaciones para mantener un entorno seguro y respetuoso.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-slate-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
                </svg>
              </div>
              <p className="texto text-slate-600">Lee los reportes a los comentarios y elimínalos en base a su carácter.</p>
            </div>
          </div>

          {/* Botones de Tareas */}
          <div className="space-y-4">
            <p className="texto text-slate-500 mb-2">Para comenzar, selecciona una tarea:</p>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Botón Solicitudes */}
              <button 
                onClick={() => navigate('/admin/solicitudes')}
                className="flex items-center justify-between w-full p-6 bg-white border border-blue-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-black">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-medium text-slate-800 font-poppins">
                    Solicitud de publicaciones
                  </span>
                </div>
                <BadgeConteo cantidad={conteos.solicitudesPublicacion} />
              </button>

              {/* Botón Reportes Publicaciones */}
              <button 
                onClick={() => navigate('/admin/reportes-publicaciones')}
                className="flex items-center justify-between w-full p-6 bg-white border border-blue-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-black">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-medium text-slate-800 font-poppins">
                    Reporte a publicaciones
                  </span>
                </div>
                <BadgeConteo cantidad={conteos.reportesPublicacion} />
              </button>

              {/* Botón Reportes Comentarios */}
              <button 
                onClick={() => navigate('/admin/reportes-comentarios')}
                className="flex items-center justify-between w-full p-6 bg-white border border-blue-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-black">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-medium text-slate-800 font-poppins">
                    Reporte a comentarios
                  </span>
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