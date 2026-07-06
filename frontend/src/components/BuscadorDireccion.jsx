/* global google */

import { useEffect, useRef, useState } from "react";

export default function BuscadorDireccion({ onPlaceSelect }) {
  const containerRef = useRef(null);
  const elementRef = useRef(null);
  const callbackRef = useRef(onPlaceSelect);
  const [error, setError] = useState("");

  callbackRef.current = onPlaceSelect;

  useEffect(() => {
    if (elementRef.current) return;
    const container = containerRef.current;
    let cancelled = false;

    async function init() {
      try {
        await google.maps.importLibrary("places");
        if (cancelled) return;

        const ac = new google.maps.places.PlaceAutocompleteElement({
          includedRegionCodes: ["CL"],
          placeholder: "Ej: Los Carrera 123, Concepción",
          noInputIcon: true,
        });

        container.appendChild(ac);

        ac.addEventListener("gmp-select", async (event) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({
            fields: ["placeId", "formattedAddress", "location"],
          });

          if (!place.location) {
            setError("Seleccioná una dirección de las sugerencias");
            return;
          }

          setError("");

          callbackRef.current({
            place_id: place.placeId,
            direccion: place.formattedAddress,
            lat: place.location.lat(),
            lng: place.location.lng(),
          });
        });

        elementRef.current = ac;
      } catch (err) {
        console.error("Error al cargar Places:", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (elementRef.current && container) {
        container.innerHTML = "";
        elementRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-1.5">
      <label className="subtitulo text-sm block">
        Dirección <span className="text-danger ml-0.5">*</span>
      </label>
      <div ref={containerRef} className="autocomplete-wrapper" />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}

      <style>{`
        .autocomplete-wrapper gmp-place-autocomplete {
          width: 100%;
          border: 1px solid #B6D5FE;
          border-radius: 25px;
          background: #F3F4F6;
          font-family: "Poppins", sans-serif;
          color-scheme: light;
          font-size: 18px;
          color: #6B7280;
          transition: all 0.2s ease;
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(input) {
          padding: 10px 16px;
          border-radius: 25px;
          background: #F3F4F6;
          font-family: "Poppins", sans-serif;
          font-size: 18px;
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(input)::placeholder {
          color: #9CA3AF;
        }
        .autocomplete-wrapper gmp-place-autocomplete:focus-within {
          border-color: #3B82F6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(prediction-list) {
          border-radius: 12px;
          border: 1px solid #B6D5FE;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(prediction-item) {
          padding: 8px 16px;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(prediction-item-selected) {
          background: #DBEAFE;
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(prediction-item-main-text) {
          color: #1F2937;
        }
        .autocomplete-wrapper gmp-place-autocomplete::part(prediction-item-secondary-text) {
          color: #6B7280;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}