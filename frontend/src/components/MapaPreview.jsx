import { useMemo } from "react";
import GoogleMap from "./GoogleMap.jsx";

function extraerCoordenadas(coordenadas) {
  if (!coordenadas) return null;

  let valor = coordenadas;
  if (typeof valor === "string") {
    try {
      valor = JSON.parse(valor);
    } catch {
      return null;
    }
  }

  if (Array.isArray(valor?.coordinates) && valor.coordinates.length === 2) {
    return {
      lng: Number(valor.coordinates[0]),
      lat: Number(valor.coordinates[1]),
    };
  }

  if (typeof valor?.lat === "number" && typeof valor?.lng === "number") {
    return { lat: valor.lat, lng: valor.lng };
  }

  return null;
}

const MAX_DISTANCIA = 2000;

function formatearDistancia(metros) {
  if (metros < 1000) return `${metros} m`;
  return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}

export default function MapaPreview({ center, universidades }) {
  const universidadesCercanas = useMemo(() => {
    if (!center || !universidades?.length) return [];

    return universidades.reduce((acc, u) => {
      const uniCoord = extraerCoordenadas(u.coordenadas);
      if (!uniCoord) return acc;

      const R = 6371e3;
      const dLat = ((uniCoord.lat - center.lat) * Math.PI) / 180;
      const dLng = ((uniCoord.lng - center.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((center.lat * Math.PI) / 180) *
          Math.cos((uniCoord.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (dist <= MAX_DISTANCIA) {
        acc.push({ ...u, distancia: Math.round(dist) });
      }
      return acc;
    }, []);
  }, [center, universidades]);

  const universidadCercana = universidadesCercanas[0] ?? null;

  const publicacionesSimuladas = useMemo(
    () =>
      universidadesCercanas.map((u) => ({
        id_publicacion: `uni-${u.id_universidad}`,
        titulo: u.nombre_universidad,
        coordenadas: u.coordenadas,
      })),
    [universidadesCercanas]
  );

  const mapCenter = center || extraerCoordenadas(universidadCercana?.coordenadas);

  if (!mapCenter) {
    return (
      <div className="bg-[#F3F4F6] border border-[#B6D5FE] rounded-panel h-[340px] flex items-center justify-center">
        <p className="texto text-sm text-ustay-muted">
          Seleccioná una dirección para ver el mapa
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#B6D5FE] rounded-panel overflow-hidden h-[340px] relative">
      <GoogleMap
        center={mapCenter}
        nombreUniversidad={"Ubicación del arriendo"}
        publicaciones={publicacionesSimuladas}
        publicacionSeleccionada={null}
        onSelectPublicacion={() => {}}
      />

      {universidadesCercanas.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 pointer-events-none">
          {universidadesCercanas.map((u) => (
            <span
              key={u.id_universidad}
              className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-ustay-text px-2.5 py-1 rounded-full shadow-sm border border-[#B6D5FE] pointer-events-auto"
            >
              {u.nombre_universidad} · {formatearDistancia(u.distancia)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
