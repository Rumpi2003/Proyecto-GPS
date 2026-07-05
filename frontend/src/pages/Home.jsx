import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarraNavegacion } from '../components/BarraNavegacion.jsx';
import { BarraInferior } from '../components/BarraInferior.jsx';
import { TarjetaUniversidad } from '../components/TarjetaUniversidad.jsx';
import { getUniversidades } from '../services/universidad.service.js';
import LogoUBB from '../assets/logos/LogoUBB.png';
import LogoUdeC from '../assets/logos/LogoUdeC.webp';
import LogoUSS from '../assets/logos/LogoUSS.png';
import LogoUCSC from '../assets/logos/LogoUCSC.png';
import escudoUsuario from '../assets/iconos/escudo-de-usuario.svg';
import marcadorMapa from '../assets/iconos/marcador-de-mapa.svg';
import comentario from '../assets/iconos/comentario-alt.svg';

function normalizarNombre(nombre) {
    return String(nombre ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

const logosPorNombre = {
    'universidad del bio-bio': LogoUBB,
    'universidad de concepcion': LogoUdeC,
    'universidad catolica de la santisima concepcion': LogoUCSC,
    'universidad san sebastian, campus las tres pascualas': LogoUSS,
}

function obtenerLogoUniversidad(nombre_universidad) {
    const clave = normalizarNombre(nombre_universidad);
    return logosPorNombre[clave] ?? LogoUBB; // Logo por defecto si no se encuentra
}

export default function Home() {
    const navigate = useNavigate();
    const [universidades, setUniversidades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function cargarUniversidades() {
            try {
                const data = await getUniversidades();
                setUniversidades(Array.isArray(data) ? data : []);
            } catch {
                setError('Error al cargar las universidades');
            } finally {
                setCargando(false);
            }
        }
        cargarUniversidades();
    }, []);

    const universidadesView = useMemo(() => {
        return universidades.map((u) => ({
            id: u.id_universidad,
            nombre: u.nombre_universidad,
            direccion: u.direccion,
            logo: obtenerLogoUniversidad(u.nombre_universidad),
        }))
    }, [universidades]);

  const handleSeleccionarUniversidad = (idUniversidad) => {
    navigate('/map', { state: { universidadId: idUniversidad } });
  };

  if (cargando) {
    return (
        <main className="flex flex-col min-h-screen">
            <BarraNavegacion />
            <div className="flex-grow flex items-center justify-center">
                Cargando universidades...
            </div>
            <BarraInferior />
        </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <div className="flex-grow flex items-center justify-center text-red-600">
          {error}
        </div>
        <BarraInferior />
      </main>
    )
  }

  return (
    // 'flex flex-col min-h-screen' hace que la pantalla sea un contenedor flexible
    <div className="flex flex-col min-h-screen">
      
      <BarraNavegacion />

      {/* 2. El Contenido Central (Tu panel blanco con las universidades) */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-grow pb-16">
      
      {/* COLUMNA IZQUIERDA: Panel Blanco Informativo (Ocupa 2 columnas en pantallas grandes) */}
      <div className="lg:col-span-2 bg-white rounded-panel shadow-soft p-6 md:p-10 flex flex-col justify-between gap-8 border border-slate-100">
        
        {/* Cabecera del Panel */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-ustay-blue tracking-tight leading-none">
            Tu plataforma de arriendos universitarios
          </h1>
          <h2 className="text-base md:text-lg font-semibold text-ustay-text/90">
            Encuentra el arriendo ideal cerca de tu universidad
          </h2>
          <p className="text-ustay-muted text-sm md:text-base leading-relaxed max-w-2xl">
            Somos una comunidad dedicada a conectar estudiantes con opciones de alojamiento seguras, verificadas y a pasos de tu campus.
          </p>
        </div>

        {/* Listado de Beneficios (Corregido el copy-paste del mockup) */}
        <div className="space-y-6 my-4">
          <div className="flex items-start gap-5">
            <img src={escudoUsuario} alt="Publicaciones Verificadas" className="w-10 h-10 p-2.5 bg-ustay-bg rounded-xl" />
            <div>
              <h5 className="font-bold text-base md:text-lg text-ustay-text">Publicaciones Verificadas</h5>
              <p className="text-sm md:text-base text-ustay-muted">Todas las publicaciones son revisadas y aprobadas por administradores para garantizar tu seguridad.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5">
            <img src={marcadorMapa} alt="Ubicación Estratégica" className="w-10 h-10 p-2.5 bg-ustay-bg rounded-xl" />
            <div>
              <h5 className="font-bold text-base md:text-lg text-ustay-text">Ubicación Estratégica</h5>
              <p className="text-sm md:text-base text-ustay-muted">Filtra por cercanía y encuentra alojamiento a minutos de tu facultad, ya sea caminando o en transporte público.</p>
            </div>
          </div>

          <div className="flex items-start gap-5">
            <img src={comentario} alt="Comunidad Activa" className="w-10 h-10 p-2.5 bg-ustay-bg rounded-xl" />
            <div>
              <h5 className="font-bold text-base md:text-lg text-ustay-text">Comunidad Activa</h5>
              <p className="text-sm md:text-base text-ustay-muted">Lee comentarios y revisa las valoraciones reales de otros estudiantes antes de tomar tu decisión.</p>
            </div>
          </div>
        </div>

        {/* Sección de Selección de Universidades */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ustay-muted">
            Para comenzar, selecciona tu universidad:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {universidadesView.map((uni) => (
              <TarjetaUniversidad 
                key={uni.id}
                nombre={uni.nombre}
                direccion={uni.direccion}
                logoUrl={uni.logo}
                onClick={() => handleSeleccionarUniversidad(uni.id)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* COLUMNA DERECHA: Bloques de Imágenes Decorativas */}
      <div className="hidden lg:flex flex-col gap-4 h-full">
        {/* Imagen Superior: El edificio */}
        <div className="flex-1 min-h-[220px] rounded-ustay-card overflow-hidden shadow-sm border border-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80" 
            alt="Edificio de departamentos" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {/* Imagen Inferior: Los estudiantes */}
        <div className="flex-1 min-h-[220px] rounded-ustay-card overflow-hidden shadow-sm border border-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80" 
            alt="Estudiantes universitarios conversando" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

    </main>

      <BarraInferior />

    </div>
  );
}