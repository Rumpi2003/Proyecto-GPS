import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BarraNavegacion } from "../components/BarraNavegacion.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";
import { getPublicacionById } from "../services/publicacion.service.js";
import { TarjetaUniversidad } from "../components/TarjetaUniversidad.jsx";
import LogoUBB from "../assets/logos/LogoUBB.png";
import LogoUdeC from "../assets/logos/LogoUdeC.webp";
import LogoUSS from "../assets/logos/LogoUSS.png";
import LogoUCSC from "../assets/logos/LogoUCSC.png";
import { useAuth } from "../context/AuthContext.jsx";
import { crearValoracion } from "../services/valoracion.service.js";
import { crearComentario } from "../services/comentario.service.js";

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

function formatearFecha(fecha) {
  if (!fecha) return "Sin dato";
  return new Date(fecha).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function portadaDe(publicacion) {
  if (!publicacion?.fotos?.length) return "";
  const portada = publicacion.fotos.find((f) => f.es_portada);
  return portada?.url_foto ?? publicacion.fotos[0].url_foto;
}

export default function Publicacion() {
  const { id_publicacion } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [valorSeleccionado, setValorSeleccionado] = useState(0);
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  const [mensajeValoracion, setMensajeValoracion] = useState("");
  const [errorValoracion, setErrorValoracion] = useState("");
  const [textoComentario, setTextoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [mensajeComentario, setMensajeComentario] = useState("");
  const [errorComentario, setErrorComentario] = useState("");

  async function publicarComentario(e) {
    e.preventDefault();

    if (!isAuthenticated) {
        setErrorComentario("Debes iniciar sesión para comentar.");
        return;
    }

    if (esPropiaPublicacion) {
        setErrorComentario("No puedes comentar tu propia publicación.");
        return;
    }

    const textoLimpio = textoComentario.trim();

    if (!textoLimpio) {
        setErrorComentario("Escribe un comentario.");
        return;
    }

    if (textoLimpio.length > 255) {
        setErrorComentario("El comentario no puede exceder los 255 caracteres.");
        return;
    }

    try {
        setEnviandoComentario(true);
        setErrorComentario("");
        setMensajeComentario("");

        await crearComentario(Number(id_publicacion), textoLimpio);

        setTextoComentario("");
        setMensajeComentario("Comentario publicado correctamente.");

        const dataActualizada = await getPublicacionById(id_publicacion);
        setPublicacion(dataActualizada);
    } catch (err) {
        const mensajeApi = err?.response?.data?.message;
        setErrorComentario(mensajeApi || "No se pudo publicar el comentario.");
    } finally {
        setEnviandoComentario(false);
    }
  }

  const esPropiaPublicacion =
    isAuthenticated &&
    Number(publicacion?.publicante?.id_usuario) === Number(user?.id);

  const yaComentoPublicacion =
    isAuthenticated &&
    (publicacion?.comentarios ?? []).some(
    (comentario) => Number(comentario.id_usuario) === Number(user?.id)
  );

  const puedeComentar =
    isAuthenticated &&
    !esPropiaPublicacion &&
    !yaComentoPublicacion &&
    publicacion?.permitir_comentarios;


  async function valorarPublicacion(puntuacion) {
    if (!isAuthenticated) {
        setErrorValoracion("Debes iniciar sesión para valorar esta publicación.");
        return;
    }
    try {
        setEnviandoValoracion(true);
        setErrorValoracion("");
        setMensajeValoracion("");

        await crearValoracion(Number(id_publicacion), puntuacion);
        setValorSeleccionado(puntuacion);
        setMensajeValoracion("Valoración registrada correctamente.");

        const dataActualizada = await getPublicacionById(id_publicacion);
        setPublicacion(dataActualizada);

    } catch (err) {
        const mensajeApi = err?.response?.data?.message;
        setErrorValoracion(mensajeApi || "No se pudo registrar la valoración.");
    } finally {
        setEnviandoValoracion(false);
    }
  }

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        const data = await getPublicacionById(id_publicacion);
        setPublicacion(data);
      } catch (err) {
        setError("No se pudo cargar la publicación");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id_publicacion]);

  const portada = useMemo(() => portadaDe(publicacion), [publicacion]);

  if (cargando) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <main className="flex-grow flex items-center justify-center texto">Cargando publicación...</main>
        <BarraInferior />
      </div>
    );
  }

  if (error || !publicacion) {
    return (
      <div className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <main className="flex-grow flex items-center justify-center text-red-600 texto">
          {error || "Publicación no encontrada"}
        </main>
        <BarraInferior />
      </div>
    );
  }

  const fotosSecundarias = (publicacion.fotos ?? []).filter((f) => !f.es_portada);

  const maxFotosVisibles = 4;
  const fotosVisibles = fotosSecundarias.slice(
    indiceCarrusel,
    indiceCarrusel + maxFotosVisibles
  );

  const puedeRetroceder = indiceCarrusel > 0;
  const puedeAvanzar =
  indiceCarrusel + maxFotosVisibles < fotosSecundarias.length;

  function retrocederFotos() {
    if (!puedeRetroceder) return;
    setIndiceCarrusel((actual) => Math.max(0, actual - 1));
  }

  function avanzarFotos() {
    if (!puedeAvanzar) return;
    setIndiceCarrusel((actual) => actual + 1);
  }

  return (
    <div className="flex flex-col min-h-screen bg-ustay-bg">
      <BarraNavegacion />

      <main className="flex-grow max-w-[1400px] mx-auto w-full px-6 py-6 pb-28 space-y-6">
        <section className="bg-white rounded-panel shadow-soft border border-slate-100 overflow-hidden">
          {portada ? (
            <img src={portada} alt={publicacion.titulo} className="w-full h-[280px] md:h-[420px] object-cover" />
          ) : (
            <div className="w-full h-[280px] md:h-[420px] bg-slate-100" />
          )}
        </section>

        <section className="bg-white rounded-panel shadow-soft border border-slate-100 p-6 md:p-8">
            <div className="w-full">
                <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h1 className="titulo text-[30px] leading-tight">
                            {publicacion.titulo}
                        </h1>

                        <div className="shrink-0 rounded-full bg-ustay-bg px-4 py-2 text-lg font-bold text-ustay-blue border border-ustay-blue/20">
                        {Number(publicacion.promedio_valoracion ?? 0).toFixed(1)}
                        </div>
                    </div>

                    <section className="rounded-ustay-card border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                        <h3 className="text-base font-semibold text-type-subtitle">Valorar publicación</h3>

                        {isLoading ? (
                            <p className="texto text-sm">Verificando sesión...</p>
                        ) : (
                            <>
                            <div className="flex items-center gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5].map((n) => {
                                const activa = n <= valorSeleccionado;

                                return (
                                    <button
                                    key={n}
                                    type="button"
                                    onClick={() => valorarPublicacion(n)}
                                    disabled={!isAuthenticated || enviandoValoracion || esPropiaPublicacion}
                                    className={[
                                        "h-10 w-10 rounded-full border text-sm font-bold transition-colors",
                                        activa
                                        ? "bg-amber-400 border-amber-500 text-white"
                                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                    ].join(" ")}
                                    aria-label={`Valorar con ${n}`}
                                    title={`Valorar con ${n}`}
                                    >
                                    {n}
                                    </button>
                                );
                                })}
                            </div>

                            {!isAuthenticated && (
                                <p className="texto text-sm text-ustay-muted">
                                Inicia sesión para poder valorar esta publicación.
                                </p>
                            )}

                            {esPropiaPublicacion && (
                                <p className="texto text-sm text-ustay-muted">
                                No puedes valorar tu propia publicación.
                                </p>
                            )}

                            {mensajeValoracion && (
                                <p className="texto text-sm text-emerald-700">{mensajeValoracion}</p>
                            )}

                            {errorValoracion && (
                                <p className="texto text-sm text-red-600">{errorValoracion}</p>
                            )}
                            </>
                        )}
                    </section>

                    


                    <p className="texto">
                        {publicacion.descripcion}
                    </p>

                    <div className="inline-flex items-center w-fit rounded-full bg-emerald-100 px-4 py-2">
                        <p className="text-2xl font-bold text-emerald-700">
                            ${Number(publicacion.precio ?? 0).toLocaleString("es-CL")}
                        </p>
                        <span className="ml-2 text-sm font-medium text-emerald-700/80">/ mes</span>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
                                Dirección: {publicacion.direccion || "Sin dato"}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
                                Teléfono: {publicacion.telefono || "Sin dato"}
                            </span>
                        </div>

                        <span className="inline-flex items-center self-end md:self-auto rounded-full bg-ustay-bg border border-ustay-blue/20 px-4 py-2.5 text-sm font-semibold text-ustay-blue">
                            Publicado: {formatearFecha(publicacion.fecha_publicacion)}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {(publicacion.etiquetas ?? []).map((etiqueta) => (
                            <span
                                key={etiqueta.id_etiqueta}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200"
                                >
                                <img
                                    src={etiqueta.url_icono}
                                    alt={etiqueta.nombreEtiqueta}
                                    className="w-5 h-5 object-contain"
                                />
                                <span>{etiqueta.nombreEtiqueta}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>


        </section>

        <section className="bg-white rounded-panel shadow-soft border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="subtitulo">Fotos</h2>

                {fotosSecundarias.length > maxFotosVisibles && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={retrocederFotos}
                            disabled={!puedeRetroceder}
                            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                            Anterior
                        </button>

                        <button
                            type="button"
                            onClick={avanzarFotos}
                            disabled={!puedeAvanzar}
                            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {fotosSecundarias.length ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {fotosVisibles.map((foto) => (
                        <button
                            key={foto.id_foto}
                            type="button"
                            onClick={() => setFotoAmpliada(foto.url_foto)}
                            className="group overflow-hidden rounded-ustay-card border border-slate-200 bg-slate-100 text-left"
                        >
                            <img
                                src={foto.url_foto}
                                alt={publicacion.titulo}
                                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </button>
                    ))}
                </div>
            ) : (
                <p className="texto">No hay fotos adicionales.</p>
            )}
        </section>

        <section className="bg-white rounded-panel shadow-soft border border-slate-100 p-6 space-y-4">
             <h2 className="subtitulo">Cercanías</h2>
             {(publicacion.cercanias ?? []).length ? ( 
                <div className="grid gap-3"> 
                    {publicacion.cercanias.map((cercania, idx) => { const nombreUni = cercania.universidad?.nombre_universidad ?? "Universidad";
                         return ( 
                            <div key={String(cercania.id_universidad ?? idx)} className="space-y-2">
                                <TarjetaUniversidad nombre={nombreUni} direccion={cercania.universidad?.direccion ?? "Sin dirección"} logoUrl={obtenerLogoUniversidad(nombreUni)} />
                                <span className="inline-flex items-center rounded-full bg-ustay-bg border border-ustay-blue/20 px-4 py-2 text-sm md:text-base font-bold text-ustay-blue"> A {cercania.distancia_metros ?? "Sin dato"} m </span>
                            </div> );
                    })} 
                </div> ) : ( <p className="texto">No hay cercanías registradas.</p> )}
        </section>

        <section className="bg-white rounded-panel shadow-soft border border-slate-100 p-6 space-y-4">
            <h2 className="subtitulo">Comentarios</h2>

            {publicacion.permitir_comentarios ? (
                <>
                {puedeComentar ? (
                    <form onSubmit={publicarComentario} className="space-y-3">
                    <textarea
                        value={textoComentario}
                        onChange={(e) => setTextoComentario(e.target.value)}
                        maxLength={255}
                        rows={3}
                        placeholder="Escribe tu comentario..."
                        disabled={enviandoComentario}
                        className="w-full rounded-ustay-card border border-slate-300 p-3 texto resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs text-ustay-muted">
                        {textoComentario.trim().length}/255
                        </p>

                        <button
                        type="submit"
                        disabled={enviandoComentario || !textoComentario.trim()}
                        className="rounded-full bg-ustay-blue text-white px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {enviandoComentario ? "Publicando..." : "Publicar comentario"}
                        </button>
                    </div>

                    {mensajeComentario && (
                        <p className="texto text-sm text-emerald-700">{mensajeComentario}</p>
                    )}

                    {errorComentario && (
                        <p className="texto text-sm text-red-600">{errorComentario}</p>
                    )}
                    </form>
                ) : (
                    <>
                    {!isAuthenticated && (
                        <p className="texto text-sm text-ustay-muted">
                        Inicia sesión para comentar.
                        </p>
                    )}

                    {esPropiaPublicacion && (
                        <p className="texto text-sm text-ustay-muted">
                        No puedes comentar tu propia publicación.
                        </p>
                    )}

                    {yaComentoPublicacion && !esPropiaPublicacion && (
                        <p className="texto text-sm text-ustay-muted">
                        Ya comentaste esta publicación.
                        </p>
                    )}
                    </>
                )}

                {(publicacion.comentarios ?? []).length ? (
                    <div className="grid gap-4">
                    {publicacion.comentarios.map((comentario, idx) => (
                        <article
                        key={String(comentario.id_usuario) + "-" + String(idx)}
                        className="rounded-ustay-card border border-slate-200 px-5 py-4 md:px-6 md:py-5"
                        >
                        <p className="text-base md:text-lg font-semibold text-type-subtitle">
                            {comentario.usuario?.nombre ?? "Usuario"}
                        </p>
                        <p className="texto text-base md:text-lg leading-relaxed">{comentario.texto}</p>
                        <p className="text-sm text-ustay-muted mt-2">
                            {formatearFecha(comentario.fecha_comentario)}
                        </p>
                        </article>
                    ))}
                    </div>
                ) : (
                    <p className="texto">Esta publicación aún no tiene comentarios.</p>
                )}
                </>
            ) : (
                <p className="texto">
                El publicante no permite comentarios en esta publicación.
                </p>
            )}
        </section>
      </main>

      <BarraInferior />

      {fotoAmpliada && (
        <div
            className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4"
            onClick={() => setFotoAmpliada(null)}
        >
            <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
            >
            <button
                type="button"
                onClick={() => setFotoAmpliada(null)}
                className="absolute top-3 right-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 hover:bg-white"
            >
                Cerrar
            </button>

            <img
                src={fotoAmpliada}
                alt="Foto ampliada"
                className="w-full max-h-[85vh] object-contain rounded-panel bg-white"
            />
            </div>
        </div>
      )}
    </div>
  );
}