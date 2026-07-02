import { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { getUniversidades, getUniversidadById } from '../services/universidad.service';

const render = (status) => <div>{status}</div>;

function Map({ center, zoom }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.google || !ref.current) return;
    new window.google.maps.Map(ref.current, { center, zoom });
  }, [center, zoom]);

  return <div ref={ref} style={{ width: '100%', height: '500px' }} />;
}

export default function GoogleMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [universidades, setUniversidades] = useState([]);
  const [universidadSeleccionada, setUniversidadSeleccionada] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getUniversidades();
        setUniversidades(data);
      } catch (e) {
        console.error('Error cargando universidades', e);
      }
    }
    cargar();
  }, []);

  async function cargarUna(id) {
    try {
      const uni = await getUniversidadById(id);
      setUniversidadSeleccionada(uni);
    } catch (e) {
      console.error('Error cargando universidad', e);
    }
  }

  return (
    <div>
      <Wrapper apiKey={apiKey} render={render}>
        <Map center={{ lat: -36.82319530467122, lng: -73.01204075092664 }} zoom={14} />
      </Wrapper>

      <h3>Universidades</h3>
      <ul>
        {universidades.map((u) => (
          <li key={u.id_universidad}>
            {u.nombre_universidad}
            <button onClick={() => cargarUna(u.id_universidad)}>
              Ver detalle
            </button>
          </li>
        ))}
      </ul>

      {universidadSeleccionada && (
        <div>
          <h4>Detalle</h4>
          <p>ID: {universidadSeleccionada.id_universidad}</p>
          <p>Nombre: {universidadSeleccionada.nombre_universidad}</p>
          <p>Dirección: {universidadSeleccionada.direccion}</p>
        </div>
      )}
    </div>
  );
}