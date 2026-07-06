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

export default function MapaPreview({ center, universidades }) {
  const universidadesCercanas = useMemo(() => {
    if (!center || !universidades?.length) return [];

    return universidades.filter((u) => {
      const uniCoord = extraerCoordenadas(u.coordenadas);
      if (!uniCoord) return false;

      const R = 6371e3;
      const dLat = ((uniCoord.lat - center.lat) * Math.PI) / 180;
      const dLng = ((uniCoord.lng - center.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((center.lat * Math.PI) / 180) *
          Math.cos((uniCoord.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return dist <= 2000;
    });
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
    <div className="bg-white border border-[#B6D5FE] rounded-panel overflow-hidden h-[340px]">
      <GoogleMap
        center={mapCenter}
        nombreUniversidad={universidadCercana?.nombre_universidad ?? "Ubicación"}
        publicaciones={publicacionesSimuladas}
        publicacionSeleccionada={null}
        onSelectPublicacion={() => {}}
      />
    </div>
  );
}
