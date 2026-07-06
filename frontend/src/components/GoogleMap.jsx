import { useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";

const MAP_STYLES = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

function obtenerLimitesMapa(center, radioKm) {
  const radioTierra = 6371;
  const latDelta = (radioKm / radioTierra) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((center.lat * Math.PI) / 180);

  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta,
  };
}

function normalizarCoordenadasPublicacion(coordenadas) {
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

function iconoPublicacion(activo = false) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: activo ? 9 : 7,
    fillColor: activo ? "#ef4444" : "#2563eb",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}

function Mapa({
  center,
  nombreUniversidad,
  publicaciones = [],
  publicacionSeleccionada,
  onSelectPublicacion,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const markerSeleccionadoRef = useRef(null);

  useEffect(() => {
    if (!window.google || !containerRef.current || !center) return;

    const limites = obtenerLimitesMapa(center, 2);

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(containerRef.current, {
        center,
        zoom: 14,
        clickableIcons: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: MAP_STYLES,
        restriction: {
          latLngBounds: limites,
          strictBounds: true,
        },
      });
    }

    const mapa = mapRef.current;

    mapa.setOptions({
      center,
      restriction: {
        latLngBounds: limites,
        strictBounds: true,
      },
      styles: MAP_STYLES,
    });

    mapa.fitBounds(limites);

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    markerSeleccionadoRef.current = null;

    const markerUniversidad = new window.google.maps.Marker({
      position: center,
      map: mapa,
      title: nombreUniversidad,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#16a34a",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      zIndex: 2000,
    });

    markersRef.current.push(markerUniversidad);

    publicaciones.forEach((publicacion) => {
      const posicion = normalizarCoordenadasPublicacion(publicacion.coordenadas);
      if (!posicion) return;

      const esActiva =
        publicacionSeleccionada?.id_publicacion === publicacion.id_publicacion;

      const marker = new window.google.maps.Marker({
        position: posicion,
        map: mapa,
        title: publicacion.titulo,
        icon: iconoPublicacion(esActiva),
        zIndex: esActiva ? 1500 : 1000,
      });

      if (esActiva) {
        markerSeleccionadoRef.current = marker;
      }

      marker.addListener("click", () => {
        onSelectPublicacion(publicacion.id_publicacion);
      });

      markersRef.current.push(marker);
    });

    if (markerSeleccionadoRef.current) {
      mapa.panTo(markerSeleccionadoRef.current.getPosition());
    }

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [center, nombreUniversidad, publicaciones, publicacionSeleccionada, onSelectPublicacion]);

  return <div ref={containerRef} className="w-full h-full min-h-[340px]" />;
}

export default function GoogleMap(props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <Wrapper apiKey={apiKey} libraries={["places"]} render={(status) => <div>{status}</div>}>
      <Mapa {...props} />
    </Wrapper>
  );
}