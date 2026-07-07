/* global google */

import { useEffect, useRef, useState } from "react";

const MIN_CHARS = 3;
const DEBOUNCE_MS = 1500;
const CACHE_MAX = 20;

export default function BuscadorDireccion({ onPlaceSelect }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onPlaceSelect);
  const autocompleteRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);
  const cacheRef = useRef(new Map());
  const cacheOrderRef = useRef([]);
  const fetchIdRef = useRef(0);

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    callbackRef.current = onPlaceSelect;
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } =
          await google.maps.importLibrary("places");

        if (cancelled) return;

        autocompleteRef.current = {
          AutocompleteSuggestion,
          AutocompleteSessionToken,
        };
        sessionTokenRef.current = new AutocompleteSessionToken();
      } catch (err) {
        console.error("Error al cargar Places:", err);
        setError("Error al cargar el servicio de direcciones");
      }
    }

    init();

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function cacheGet(key) {
    const k = key.toLowerCase();
    if (!cacheRef.current.has(k)) return null;
    const idx = cacheOrderRef.current.indexOf(k);
    if (idx > -1) cacheOrderRef.current.splice(idx, 1);
    cacheOrderRef.current.push(k);
    return cacheRef.current.get(k);
  }

  function cacheSet(key, data) {
    const k = key.toLowerCase();
    if (cacheRef.current.has(k)) {
      const idx = cacheOrderRef.current.indexOf(k);
      if (idx > -1) cacheOrderRef.current.splice(idx, 1);
    }
    cacheRef.current.set(k, data);
    cacheOrderRef.current.push(k);
    if (cacheOrderRef.current.length > CACHE_MAX) {
      const oldest = cacheOrderRef.current.shift();
      cacheRef.current.delete(oldest);
    }
  }

  async function fetchPredictions(value) {
    const places = autocompleteRef.current;
    if (!places || !sessionTokenRef.current) return;

    const { AutocompleteSuggestion } = places;

    const cached = cacheGet(value);
    if (cached) {
      setSuggestions(cached);
      setIsOpen(cached.length > 0);
      setActiveIndex(-1);
      return;
    }

    const id = ++fetchIdRef.current;
    setIsLoading(true);

    try {
      const { suggestions: apiSuggestions } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          region: "cl",
          sessionToken: sessionTokenRef.current,
          locationRestriction: {
            north: -17.5,
            south: -56.0,
            west: -76.0,
            east: -66.0,
          },
        });

      if (id !== fetchIdRef.current) return;

      const mapped = (apiSuggestions ?? []).map((s) => ({
        placePrediction: s.placePrediction,
        text: s.placePrediction.text.text,
        mainText:
          s.placePrediction.structuredFormat?.mainText?.text ??
          s.placePrediction.text.text,
        secondaryText:
          s.placePrediction.structuredFormat?.secondaryText?.text,
      }));

      cacheSet(value, mapped);
      setSuggestions(mapped);
      setIsOpen(mapped.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Error en autocompletado:", err);
      if (id === fetchIdRef.current && !cacheGet(value)) {
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      if (id === fetchIdRef.current) setIsLoading(false);
    }
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setInputValue(value);
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < MIN_CHARS) {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(() => fetchPredictions(value), DEBOUNCE_MS);
  }

  async function handleSelect(suggestion) {
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ["formattedAddress", "location"],
      });

      if (!place.location) {
        setError("Seleccioná una dirección de las sugerencias");
        return;
      }

      setError("");

      const { AutocompleteSessionToken } = autocompleteRef.current;
      sessionTokenRef.current = new AutocompleteSessionToken();

      setInputValue(suggestion.text);

      callbackRef.current({
        place_id: place.id ?? place.placeId,
        direccion: place.formattedAddress ?? suggestion.text,
        lat: place.location.lat(),
        lng: place.location.lng(),
      });
    } catch (err) {
      console.error("Error al obtener datos de la dirección:", err);
      setError("Error al obtener los datos de la dirección");
    }
  }

  function handleKeyDown(e) {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  function handleBlur() {
    setTimeout(() => {
      setIsOpen(false);
      setActiveIndex(-1);
    }, 200);
  }

  function handleFocus() {
    if (suggestions.length > 0 && inputValue.length >= MIN_CHARS) {
      setIsOpen(true);
    }
  }

  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="space-y-1.5">
      <label className="subtitulo text-texto block">
        Dirección <span className="text-danger ml-0.5">*</span>
      </label>

      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Ej: Los Carrera 123, Concepción"
          autoComplete="off"
          className={`w-full border border-[#B6D5FE] rounded-[25px] bg-[#F3F4F6] px-4 py-2.5 font-['Poppins'] text-lg text-[#6B7280] outline-none transition-all duration-200 placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3)] ${
            isLoading ? "pr-10" : ""
          }`}
        />

        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-[#B6D5FE] rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li
                key={s.text}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`px-4 py-2.5 cursor-pointer font-['Poppins'] text-sm transition-colors ${
                  i === activeIndex
                    ? "bg-[#DBEAFE]"
                    : "bg-white hover:bg-[#DBEAFE]"
                }`}
              >
                <span className="text-[#1F2937]">{s.mainText}</span>
                {s.secondaryText && (
                  <>
                    ,{" "}
                    <span className="text-[#6B7280] text-xs">
                      {s.secondaryText}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
