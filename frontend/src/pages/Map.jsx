import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarraNavegacion } from "../components/BarraNavegacion.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";
import { TarjetaUniversidad } from "../components/TarjetaUniversidad.jsx";
import TarjetaPublicacion from "../components/TarjetaPublicacion.jsx";
import GoogleMap from "../components/GoogleMap.jsx";
import FiltrosPublicacion from "../components/FiltrosPublicacion.jsx";
import { getUniversidades } from "../services/universidad.service.js";
import { getPublicacionesFiltradas } from "../services/publicacion.service.js";
import { getEtiquetas } from "../services/etiqueta.service.js";
import LogoUBB from "../assets/logos/LogoUBB.png";
import LogoUdeC from "../assets/logos/LogoUdeC.webp";
import LogoUSS from "../assets/logos/LogoUSS.png";
import LogoUCSC from "../assets/logos/LogoUCSC.png";

function normalizarNombre(nombre) {
  return String(nombre ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const logosPorNombre = {
  "universidad del bio-bio": LogoUBB,
  "universidad de concepcion": LogoUdeC,
  "universidad catolica de la santisima concepcion": LogoUCSC,
  "universidad san sebastian, campus las tres pascualas": LogoUSS,
};

function obtenerLogoUniversidad(nombreUniversidad) {
  const clave = normalizarNombre(nombreUniversidad);
  return logosPorNombre[clave] ?? LogoUBB;
}

function normalizarCoordenadas(coordenadas) {
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

export default function Map() {
  const location = useLocation();
  const navigate = useNavigate();
  const idInicial = location.state?.universidadId;

  const [universidades, setUniversidades] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [universidadSeleccionada, setUniversidadSeleccionada] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(false);
  const [error, setError] = useState("");
  const listaPublicacionesRef = useRef(null);
  const [ordenPublicaciones, setOrdenPublicaciones] = useState("distancia-asc");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const ultimoTapRef = useRef({ id: null, time: 0 });

  function manejarTapPublicacion(idPublicacion) {
    seleccionarPublicacion(idPublicacion);

    const ahora = Date.now();
    const fueDobleTap =
      ultimoTapRef.current.id === idPublicacion &&
      ahora - ultimoTapRef.current.time < 320;

    if (fueDobleTap) {
      irAPublicacion(idPublicacion);
      ultimoTapRef.current = { id: null, time: 0 };
      return;
    }

    ultimoTapRef.current = { id: idPublicacion, time: ahora };
  }


  function irAPublicacion(idPublicacion) {
    navigate(`/publicacion/${idPublicacion}`);
  }

  function obtenerDistancia(publicacion, universidadId) {
    const cercania = publicacion.cercanias?.find(
      (c) => String(c.id_universidad) === String(universidadId)
    );

    return cercania?.distancia_metros ?? null;
  }

  const publicacionesOrdenadas = useMemo(() => {
    const copia = [...publicaciones];

    const valorParaDistancia = (publicacion) =>
      obtenerDistancia(publicacion, universidadSeleccionada?.id_universidad) ?? Number.POSITIVE_INFINITY;

    const valorParaPrecio = (publicacion) => Number(publicacion.precio ?? 0);
    const valorParaValoracion = (publicacion) => Number(publicacion.promedio_valoracion ?? 0);

    const comparadores = {
      "distancia-asc": (a, b) => valorParaDistancia(a) - valorParaDistancia(b),
      "distancia-desc": (a, b) => valorParaDistancia(b) - valorParaDistancia(a),
      "precio-asc": (a, b) => valorParaPrecio(a) - valorParaPrecio(b),
      "precio-desc": (a, b) => valorParaPrecio(b) - valorParaPrecio(a),
      "valoracion-asc": (a, b) => valorParaValoracion(a) - valorParaValoracion(b),
      "valoracion-desc": (a, b) => valorParaValoracion(b) - valorParaValoracion(a),
    };

    return copia.sort(comparadores[ordenPublicaciones] ?? comparadores["distancia-asc"]);
  }, [publicaciones, ordenPublicaciones, universidadSeleccionada]);

  const filtrosIniciales = {
    distancia_max: 2000,
    ids_etiquetas: [],
    precio_max: "",
    valoracion_min: 0,
  };

  const [filtrosDraft, setFiltrosDraft] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);

  useEffect(() => {
    if (!filtrosAbiertos) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [filtrosAbiertos]);

  useEffect(() => {
    async function cargarInicial() {
      try {
        const [universidadesData, etiquetasData] = await Promise.all([
          getUniversidades(),
          getEtiquetas(),
        ]);

        setUniversidades(Array.isArray(universidadesData) ? universidadesData : []);
        setEtiquetas(Array.isArray(etiquetasData) ? etiquetasData : []);

        if (idInicial != null) {
          const uni = universidadesData.find(
            (u) => String(u.id_universidad) === String(idInicial)
          );
          if (uni) setUniversidadSeleccionada(uni);
        }
      } catch {
        setError("Error al cargar datos iniciales");
      } finally {
        setCargando(false);
      }
    }

    cargarInicial();
  }, [idInicial]);

  useEffect(() => {
    async function cargarPublicaciones() {
      if (!universidadSeleccionada) return;

      try {
        setCargandoPublicaciones(true);

        const params = {
          id_universidad: universidadSeleccionada.id_universidad,
          distancia_max: filtrosAplicados.distancia_max || undefined,
          precio_max: filtrosAplicados.precio_max || undefined,
          valoracion_min: filtrosAplicados.valoracion_min || undefined,
          ids_etiquetas: filtrosAplicados.ids_etiquetas.length
            ? filtrosAplicados.ids_etiquetas.join(",")
            : undefined,
        };

        const data = await getPublicacionesFiltradas(params);
        setPublicaciones(Array.isArray(data) ? data : []);
        setPublicacionSeleccionada(null);
      } catch(err) {
        console.error("Error al cargar publicaciones:", err);
        setError("Error al cargar publicaciones");
      } finally {
        setCargandoPublicaciones(false);
      }
    }

    cargarPublicaciones();
  }, [universidadSeleccionada, filtrosAplicados]);

  const center = useMemo(() => {
    return normalizarCoordenadas(universidadSeleccionada?.coordenadas);
  }, [universidadSeleccionada]);

  function seleccionarPublicacion(idPublicacion) {
    const pub = publicaciones.find((p) => p.id_publicacion === idPublicacion);
    setPublicacionSeleccionada(pub ?? null);
  }

  function cambiarUniversidad(idUniversidad) {
    const uni = universidades.find(
      (u) => String(u.id_universidad) === String(idUniversidad)
    );
    setUniversidadSeleccionada(uni ?? null);
  }

  useEffect(() => {
    const idSeleccionada = publicacionSeleccionada?.id_publicacion;
    if (!idSeleccionada) return;

    const contenedor = listaPublicacionesRef.current;
    if (!contenedor) return;

    const item = contenedor.querySelector(
      `[data-publicacion-id="${idSeleccionada}"]`
    );
    if (!item) return;

    const esDesktop = window.matchMedia("(min-width: 1280px)").matches;

    if (!esDesktop) {
      item.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      return;
    }

    const contRect = contenedor.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const fueraDeVista =
      itemRect.top < contRect.top || itemRect.bottom > contRect.bottom;

    if (fueraDeVista) {
      const offset =
        item.offsetTop - contenedor.offsetTop - contenedor.clientHeight / 2 +
        item.clientHeight / 2;

      contenedor.scrollTo({
        top: Math.max(0, offset),
        behavior: "smooth",
      });
    }
  }, [publicacionSeleccionada]);

  if (cargando) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <main className="flex-grow flex items-center justify-center">
          Cargando...
        </main>
        <BarraInferior />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <main className="flex-grow flex items-center justify-center text-red-600">
          {error}
        </main>
        <BarraInferior />
      </div>
    );
  }

  if (!universidadSeleccionada || !center) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-8">
          <div className="bg-white rounded-panel shadow-soft p-6 border border-slate-100">
            <h1 className="titulo mb-4">Selecciona una universidad</h1>
            <div className="grid gap-3">
              {universidades.map((uni) => (
                <button
                  key={uni.id_universidad}
                  onClick={() => cambiarUniversidad(uni.id_universidad)}
                  className="text-left p-4 rounded-ustay-card border border-slate-200 hover:bg-slate-50"
                >
                  {uni.nombre_universidad}
                </button>
              ))}
            </div>
          </div>
        </main>
        <BarraInferior />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen xl:h-screen xl:overflow-hidden">
      <BarraNavegacion />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-4 xl:box-border xl:h-[calc(100dvh-9rem)] xl:overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_520px] gap-4 lg:gap-6 items-start xl:items-stretch xl:h-full xl:min-h-0">
          <aside className="hidden xl:block bg-white rounded-panel shadow-soft border border-slate-100 p-5 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pb-24">
            <FiltrosPublicacion
              universidades={universidades}
              universidadSeleccionada={universidadSeleccionada}
              etiquetas={etiquetas}
              filtros={filtrosDraft}
              onChangeFiltros={setFiltrosDraft}
              onChangeUniversidad={cambiarUniversidad}
              onAplicarFiltros={() => setFiltrosAplicados(filtrosDraft)}
              onLimpiarFiltros={() => {
                setFiltrosDraft(filtrosIniciales);
                setFiltrosAplicados(filtrosIniciales);
              }}
            />
          </aside>

          <section className="pr-1 min-w-0 order-2 xl:order-2 xl:h-full xl:min-h-0 xl:flex xl:flex-col">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(true)}
                className="xl:hidden rounded-ustay-card border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ustay-text shadow-soft"
              >
                Filtros
              </button>

              <div className="flex items-center justify-start sm:justify-end">
                <select
                  value={ordenPublicaciones}
                  onChange={(e) => setOrdenPublicaciones(e.target.value)}
                  className="rounded-ustay-card border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="distancia-asc">Distancia: menor a mayor</option>
                  <option value="distancia-desc">Distancia: mayor a menor</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="valoracion-asc">Valoración: menor a mayor</option>
                  <option value="valoracion-desc">Valoración: mayor a menor</option>
                </select>
              </div>
            </div>
            <div ref={listaPublicacionesRef} className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-6 pr-2 -mx-1 px-1
             xl:space-y-4 xl:block xl:overflow-x-hidden xl:overflow-y-auto xl:pb-24 xl:pr-2 xl:mx-0 xl:px-0 xl:flex-1 xl:min-h-0">
              {cargandoPublicaciones ? (
                <div className="texto">Cargando publicaciones...</div>
              ) : publicaciones.length > 0 ? (
                publicacionesOrdenadas.map((publicacion) => (
                  <div key={publicacion.id_publicacion} data-publicacion-id={publicacion.id_publicacion} onClick={() => manejarTapPublicacion(publicacion.id_publicacion)} onDoubleClick={() => irAPublicacion(publicacion.id_publicacion)} className="min-w-[82vw] max-w-[82vw] snap-start shrink-0
                  sm:min-w-[440px] sm:max-w-[440px]
                  xl:min-w-0 xl:max-w-none xl:shrink xl:snap-none">
                     <TarjetaPublicacion 
                       publicacion={publicacion}
                       universidadId={universidadSeleccionada.id_universidad}
                       activa={ publicacionSeleccionada?.id_publicacion === publicacion.id_publicacion }
                       onClick={() => seleccionarPublicacion(publicacion.id_publicacion)}
                     />
                   </div>
                ))
              ) : (
                <div className="bg-white rounded-panel shadow-soft border border-slate-100 p-6 texto">
                  No hay publicaciones que coincidan con los filtros.
                </div>
              )}
            </div>
          </section>

          <section className="order-1 xl:order-3 space-y-4">
            <TarjetaUniversidad
              nombre={universidadSeleccionada.nombre_universidad}
              direccion={universidadSeleccionada.direccion}
              logoUrl={obtenerLogoUniversidad(universidadSeleccionada.nombre_universidad)}
            />

            <div className="bg-white rounded-panel shadow-soft border border-slate-100 overflow-hidden h-[320px] lg:h-[380px]">
              <GoogleMap
                center={center}
                nombreUniversidad={universidadSeleccionada.nombre_universidad}
                publicaciones={publicaciones}
                publicacionSeleccionada={publicacionSeleccionada}
                onSelectPublicacion={seleccionarPublicacion}
              />
            </div>
          </section>
        </div>
      </main>

      {filtrosAbiertos && (
        <div
          className="fixed inset-0 z-[60] xl:hidden bg-black/50 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] flex items-end overflow-hidden"
          onClick={() => setFiltrosAbiertos(false)}
        >
          <div
            className="w-full max-h-[calc(100dvh-(env(safe-area-inset-bottom)+7.5rem))] overflow-y-auto bg-white rounded-t-[28px] rounded-b-[20px] p-5 shadow-xl overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                className="text-2xl leading-none text-ustay-muted"
              >
                ×
              </button>
            </div>

            <FiltrosPublicacion
              universidades={universidades}
              universidadSeleccionada={universidadSeleccionada}
              etiquetas={etiquetas}
              filtros={filtrosDraft}
              onChangeFiltros={setFiltrosDraft}
              onChangeUniversidad={cambiarUniversidad}
              onAplicarFiltros={() => {
                setFiltrosAplicados(filtrosDraft);
                setFiltrosAbiertos(false);
              }}
              onLimpiarFiltros={() => {
                setFiltrosDraft(filtrosIniciales);
                setFiltrosAplicados(filtrosIniciales);
              }}
            />
          </div>
        </div>
      )}

      <BarraInferior />
    </div>
  );
}
