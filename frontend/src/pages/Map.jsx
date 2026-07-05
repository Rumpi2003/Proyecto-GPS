import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GoogleMap from '../components/GoogleMap';
import { BarraNavegacion } from '../components/BarraNavegacion';
import { BarraInferior } from '../components/BarraInferior';
import { getUniversidades } from '../services/universidad.service';
import '../App.css';

function normalizarCoordenadas(coordenadas) {
  if (!coordenadas) return null;

  let valor = coordenadas;
  if (typeof valor === 'string') {
    try {
      valor = JSON.parse(valor);
    } catch {
      console.error('Error al parsear las coordenadas:', valor);
      return null;
    }
  }

  if (Array.isArray(valor?.coordinates) && valor.coordinates.length === 2) {
    return {
      lng: Number(valor.coordinates[0]),
      lat: Number(valor.coordinates[1]),
    };
  }

  if (Array.isArray(valor?.coordenadas) && valor.coordenadas.length === 2) {
    return {
      lng: Number(valor.coordenadas[0]),
      lat: Number(valor.coordenadas[1]),
    };
  }

  if (typeof valor?.lat === 'number' && typeof valor?.lng === 'number') {
    return { lat: valor.lat, lng: valor.lng };
  }

  return null;
}

export default function Map() {
  const location = useLocation();
  const idInicial = location.state?.universidadId;

  const [universidades, setUniversidades] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [universidadSeleccionada, setUniversidadSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarUniversidades() {
      try {
        const data = await getUniversidades();
        const lista = Array.isArray(data) ? data : [];
        setUniversidades(lista);

        if (idInicial != null) {
          const uni = lista.find((u) => String(u.id_universidad) === String(idInicial));
          if (uni) {
            setUniversidadSeleccionada(uni);
            setIdSeleccionado(String(uni.id_universidad));
          }
        }
      } catch (error) {
        setError('Error al cargar las universidades');
      } finally {
        setCargando(false);
      }
    }

    cargarUniversidades();
  }, []);

  const puedeContinuar = useMemo(() => idSeleccionado !== '', [idSeleccionado]);

  function continuar() {
    const uni = universidades.find((u) => String(u.id_universidad) === String(idSeleccionado));
    if (!uni) return;
    setUniversidadSeleccionada(uni);
  }

  function cambiarUniversidad() {
    setUniversidadSeleccionada(null);
  }

  if (cargando) return (
    <div className="flex flex-col min-h-screen">
    <BarraNavegacion />

    <main className="flex-grow px-6 py-6">
      <div>Cargando universidades...</div>
    </main>

    <BarraInferior />
  </div>
  ); 
  
  if (error) return (
    <div className="flex flex-col min-h-screen">
      <BarraNavegacion />

      <main className="flex-grow px-6 py-6">
        <div className="text-red-600">{error}</div>
      </main>

      <BarraInferior />
    </div>
  );

  if (!universidadSeleccionada) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />

        <main className="flex-grow px-6 py-6">
          <div style={{ padding: 24 }}>
            <h1>Selecciona una universidad</h1>

            <select
              value={idSeleccionado}
              onChange={(e) => setIdSeleccionado(e.target.value)}
              style={{ minWidth: 320, padding: 8, marginRight: 12 }}
            >
              <option value=''>Selecciona una universidad</option>
              {universidades.map((u) => (
                <option key={u.id_universidad} value={u.id_universidad}>
                  {u.nombre_universidad}
                </option>
              ))}
            </select>

            <button onClick={continuar} disabled={!puedeContinuar}>
              Continuar
            </button>
          </div>
        </main>

        <BarraInferior />
      </div>
    );
  }

  const center = normalizarCoordenadas(universidadSeleccionada.coordenadas);

  if (!center) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />
        
        <main className="flex-grow px-6 py-6">
          <div style={{ padding: 24 }}>
            <p>No se pudieron obtener las coordenadas de la universidad seleccionada.</p>
            <button onClick={cambiarUniversidad}>Cambiar universidad</button>
          </div>
        </main>

        <BarraInferior />
      </div>
    );
  }

  return (
  <div className="flex flex-col min-h-screen">
    <BarraNavegacion />

    <main className="flex-grow px-6 py-6">
      <h1>{universidadSeleccionada.nombre_universidad}</h1>
      <button onClick={cambiarUniversidad} style={{ marginBottom: 12 }}>
        Cambiar universidad
      </button>
      <GoogleMap
        center={center}
        nombre_universidad={universidadSeleccionada.nombre_universidad}
      />
    </main>

    <BarraInferior />
  </div>
  );
}
