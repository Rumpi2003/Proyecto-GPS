import { useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

function obtenerLimitesMapa(center, radioKm) {
  const radioTierra = 6371; // Radio de la Tierra en km
  const latDelta = (radioKm / radioTierra) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((center.lat * Math.PI) / 180);

  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta,
  };
}

function Mapa({ center, nombre_universidad }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (!window.google || !containerRef.current || !center) return;

    const limites = obtenerLimitesMapa(center, 5); // 5 km de radio

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(containerRef.current, {
        center,
        zoom: 14,
        clickableIcons: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        restriction: {
          latLngBounds: limites,
          strictBounds: true,
        },
        styles: MAP_STYLES,
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

    if (markerRef.current)  markerRef.current.setMap(null);
    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapa,
      title: nombre_universidad,
    });

    if (circleRef.current) circleRef.current.setMap(null);
    circleRef.current = new window.google.maps.Circle({
      map : mapa,
      center,
      radius: 2000, // 2 km
      strokeColor: '#2563eb',
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: '#2563eb',
      fillOpacity: 0.08,
    });

    return () => {
      if (markerRef.current) markerRef.current.setMap(null);
      if (circleRef.current) circleRef.current.setMap(null);
    };


  }, [center, nombre_universidad]);

  return <div ref={containerRef} style={{ width: '100%', height: '70vh', borderRadius: '12' }} />;
}

export default function GoogleMap({ center, nombre_universidad }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return (
    <Wrapper apiKey={apiKey} render={(status) => <div>{status}</div>}>
      <Mapa center={center} nombre_universidad={nombre_universidad} />
    </Wrapper>
  );
}