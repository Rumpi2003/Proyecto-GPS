import { BarraNavegacion } from '../components/BarraNavegacion.jsx';
import { BarraInferior } from '../components/BarraInferior.jsx';
import { TarjetaUniversidad } from '../components/TarjetaUniversidad.jsx';
import LogoUBB from '../assets/LogoUBB.png';
import LogoUdeC from '../assets/LogoUdeC.webp';
import LogoUSS from '../assets/LogoUSS.png';
import LogoUCSC from '../assets/LogoUCSC.png';

export default function Home() {
    const universidades = [
    {
      id: 'ubb',
      nombre: 'Universidad Del Bío-Bío',
      direccion: 'Avenida Collao 1202, Concepción.',
      logo: LogoUBB 
    },
    {
      id: 'udec',
      nombre: 'Universidad De Concepción',
      direccion: 'Víctor Lamas 1290, Concepción.',
      logo: LogoUdeC 
    },
    {
      id: 'uss',
      nombre: 'Universidad San Sebastián',
      direccion: 'Lientur 1457, Concepción.',
      logo: LogoUSS 
    },
    {
      id: 'ucsc',
      nombre: 'Universidad Católica de la Santísima Concepción',
      direccion: 'Av. Alonso de Ribera 2850, Concepción.',
      logo: LogoUCSC 
    }
  ];

  const handleSeleccionarUniversidad = (id) => {
    console.log(`Universidad seleccionada: ${id}`);
    // Aquí es donde redirige al buscador de arriendos por filtro de la universidad seleccionada.
  };

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
        <div className="space-y-4 my-2">
          <div className="flex items-start gap-4">
            <span className="text-2xl p-2 bg-ustay-bg rounded-xl">🛡️</span>
            <div>
              <h5 className="font-bold text-sm text-ustay-text">Publicaciones Verificadas</h5>
              <p className="text-xs md:text-sm text-ustay-muted">Todas las publicaciones son revisadas y aprobadas por administradores para garantizar tu seguridad.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-2xl p-2 bg-ustay-bg rounded-xl">📍</span>
            <div>
              <h5 className="font-bold text-sm text-ustay-text">Ubicación Estratégica</h5>
              <p className="text-xs md:text-sm text-ustay-muted">Filtra por cercanía y encuentra alojamiento a minutos de tu facultad, ya sea caminando o en transporte público.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-2xl p-2 bg-ustay-bg rounded-xl">💬</span>
            <div>
              <h5 className="font-bold text-sm text-ustay-text">Comunidad Activa</h5>
              <p className="text-xs md:text-sm text-ustay-muted">Lee comentarios y revisa las valoraciones reales de otros estudiantes antes de tomar tu decisión.</p>
            </div>
          </div>
        </div>

        {/* Sección de Selección de Universidades */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ustay-muted">
            Para comenzar, selecciona tu universidad:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {universidades.map((uni) => (
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