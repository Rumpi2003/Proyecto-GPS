import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BarraNavegacion } from "../components/BarraNavegacion.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";
import InputField from "../components/InputField.jsx";
import SubirFotos from "../components/SubirFotos.jsx";
import SelectorEtiquetas from "../components/SelectorEtiquetas.jsx";
import MapaPreview from "../components/MapaPreview.jsx";
import { getEtiquetas } from "../services/etiqueta.service.js";
import { getUniversidades } from "../services/universidad.service.js";
import { getPublicacionById, updatePublicacion } from "../services/publicacion.service.js";
import { Wrapper } from "@googlemaps/react-wrapper";

function obtenerUrlFoto(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = import.meta.env.VITE_API_URL || "";
  const apiBase = base.replace(/\/api\/?$/, "");
  return apiBase ? `${apiBase}${url}` : url;
}

function extraerCoordenadas(coordenadas) {
  if (!coordenadas) return null;
  let valor = coordenadas;
  if (typeof valor === "string") {
    try { valor = JSON.parse(valor); } catch { return null; }
  }
  if (Array.isArray(valor?.coordinates) && valor.coordinates.length === 2) {
    return { lat: Number(valor.coordinates[1]), lng: Number(valor.coordinates[0]) };
  }
  if (typeof valor?.lat === "number" && typeof valor?.lng === "number") {
    return { lat: valor.lat, lng: valor.lng };
  }
  return null;
}

export default function EditarPublicacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [etiquetas, setEtiquetas] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    telefono: "",
    permitir_comentarios: true,
    portada: null,        // File | null — nueva portada
    fotos: [],            // File[] — fotos nuevas
    etiquetas: [],        // IDs seleccionados
  });

  // Datos existentes de la publicación
  const [publicacionData, setPublicacionData] = useState(null);
  const etiquetasOriginalesRef = useRef([]);
  const [fotosAEliminar, setFotosAEliminar] = useState([]); // IDs de fotos a eliminar

  const [direccion, setDireccion] = useState({
    direccion: "",
    lat: null,
    lng: null,
  });

  useEffect(() => {
    async function cargar() {
      try {
        const [publicacion, etiquetasData, universidadesData] = await Promise.all([
          getPublicacionById(id),
          getEtiquetas(),
          getUniversidades(),
        ]);

        setPublicacionData(publicacion);
        setEtiquetas(Array.isArray(etiquetasData) ? etiquetasData : []);
        setUniversidades(Array.isArray(universidadesData) ? universidadesData : []);

        // Pre-fill form
        const idsEtiquetas = (publicacion.etiquetas || []).map((e) => e.id_etiqueta);
        etiquetasOriginalesRef.current = idsEtiquetas;

        setForm({
          titulo: publicacion.titulo || "",
          descripcion: publicacion.descripcion || "",
          precio: publicacion.precio?.toString() || "",
          telefono: publicacion.telefono || "",
          permitir_comentarios: publicacion.permitir_comentarios ?? true,
          portada: null,
          fotos: [],
          etiquetas: idsEtiquetas,
        });

        // Set address & coordinates
        const coords = extraerCoordenadas(publicacion.coordenadas);
        setDireccion({
          direccion: publicacion.direccion || "",
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        });
      } catch (err) {
        const data = err?.response?.data;
        const msgs = Array.isArray(data?.message)
          ? data.message
          : [data?.message || err.message || "Error al cargar la publicación"];
        setError(msgs);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleTelefonoChange(e) {
    const filtrado = e.target.value.replace(/[^+\d\s]/g, "");
    actualizar("telefono", filtrado);
  }

  function toggleEliminarFoto(idFoto) {
    setFotosAEliminar((prev) =>
      prev.includes(idFoto)
        ? prev.filter((id) => id !== idFoto)
        : [...prev, idFoto]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Si eliminaron la portada sin subir una nueva, advertir
    if (portadaExistente && fotosAEliminar.includes(portadaExistente.id_foto) && !form.portada) {
      setError("No puede dejar la publicación sin portada. Suba una nueva portada o recupere la existente.");
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo.trim());
      formData.append("descripcion", form.descripcion.trim());
      formData.append("precio", String(Number(form.precio)));
      formData.append("telefono", form.telefono.trim());
      formData.append("permitir_comentarios", String(form.permitir_comentarios));

      // Fotos a eliminar
      if (fotosAEliminar.length > 0) {
        formData.append("eliminar_fotos", JSON.stringify(fotosAEliminar));
      }

      // Etiquetas diff: calcular qué quitar y qué agregar
      const originales = etiquetasOriginalesRef.current;
      const eliminarEtiquetas = originales.filter((id) => !form.etiquetas.includes(id));
      const nuevasEtiquetas = form.etiquetas.filter((id) => !originales.includes(id));
      formData.append("eliminar_etiquetas", JSON.stringify(eliminarEtiquetas));
      formData.append("nuevas_etiquetas", JSON.stringify(nuevasEtiquetas));

      // Portada nueva (si subió una)
      if (form.portada) {
        formData.append("portada", form.portada);
      }

      // Fotos nuevas
      form.fotos.forEach((foto) => formData.append("fotos", foto));

      await updatePublicacion(id, formData);
      navigate("/mis-publicaciones");
    } catch (err) {
      const data = err?.response?.data;
      const msgs = Array.isArray(data?.message)
        ? data.message
        : [data?.message || err.message || "Error al actualizar la publicación"];
      setError(msgs);
    } finally {
      setEnviando(false);
    }
  }

  // Obtener URLs de fotos existentes
  const portadaExistente = publicacionData?.fotos?.find((f) => f.es_portada);
  const fotosExistentes = (publicacionData?.fotos || []).filter((f) => !f.es_portada);
  const fotosQueQuedan = fotosExistentes.filter((f) => !fotosAEliminar.includes(f.id_foto));
  const puedeRecuperarFoto = fotosQueQuedan.length + form.fotos.length < 4;
  const maxFotosNuevas = Math.max(0, 4 - fotosQueQuedan.length);

  const center =
    direccion.lat != null && direccion.lng != null
      ? { lat: direccion.lat, lng: direccion.lng }
      : null;

  // ---- Auth guard ----
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#DBEAFE]">
        <BarraNavegacion />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-panel shadow-soft p-8 max-w-md text-center border border-[#B6D5FE]">
            <h2 className="titulo mb-2">Inicia sesión</h2>
            <p className="texto text-sm text-ustay-muted mb-4">
              Necesitas una cuenta registrada para editar arriendos.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-ustay-blue text-white rounded-full px-6 py-2.5 font-semibold hover:bg-ustay-blue-dark transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </main>
        <BarraInferior />
      </div>
    );
  }

  // ---- Loading skeleton ----
  if (cargando) {
    return (
      <div className="flex flex-col min-h-screen bg-[#DBEAFE]">
        <BarraNavegacion />
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-28">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 items-start">
              <div className="bg-[#F3F4F6] border border-[#B6D5FE] rounded-panel p-6 md:p-8 space-y-5">
                <div className="h-10 bg-slate-200 rounded-[25px]" />
                <div className="h-10 bg-slate-200 rounded-[25px]" />
                <div className="h-28 bg-slate-200 rounded-[18px]" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-200 rounded-[25px]" />
                  <div className="h-10 bg-slate-200 rounded-[25px]" />
                </div>
                <div className="h-24 bg-slate-200 rounded-[25px]" />
              </div>
              <div className="h-[340px] bg-slate-200 rounded-panel" />
            </div>
          </div>
        </main>
        <BarraInferior />
      </div>
    );
  }

  // ---- Error al cargar ----
  if (error && !publicacionData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#DBEAFE]">
        <BarraNavegacion />
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col items-center justify-center gap-4">
          <div className="bg-white rounded-panel shadow-soft p-8 max-w-md border border-[#B6D5FE]">
            {Array.isArray(error) ? (
              error.map((msg, i) => (
                <p key={i} className="texto text-danger text-center mb-2">{msg}</p>
              ))
            ) : (
              <p className="texto text-danger text-center">{error}</p>
            )}
            <button
              onClick={() => navigate("/mis-publicaciones")}
              className="mt-4 w-full rounded-full bg-ustay-blue text-white px-6 py-2.5 font-semibold hover:bg-ustay-blue-dark transition-all"
            >
              Volver a Mis Publicaciones
            </button>
          </div>
        </main>
        <BarraInferior />
      </div>
    );
  }

  // ---- Main form ----
  return (
    <div className="flex flex-col min-h-screen bg-[#DBEAFE]">
      <BarraNavegacion />

      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-28">
        <form onSubmit={handleSubmit}>
          <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]} render={(status) => <div>{status}</div>}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 items-start">
            <div className="bg-[#F3F4F6] border border-[#B6D5FE] rounded-panel p-6 md:p-8 space-y-5">
              <h1 className="titulo">Editar publicación</h1>

              <InputField
                label="Título"
                value={form.titulo}
                onChange={(e) => actualizar("titulo", e.target.value)}
                placeholder="Ej: Departamento amoblado cerca de la UBB"
                required
              />

              {/* Dirección — solo lectura */}
              <div className="space-y-1.5">
                <label className="subtitulo text-texto block">
                  Dirección <span className="text-danger ml-0.5">*</span>
                </label>
                <div className="w-full border border-[#B6D5FE] rounded-[25px] bg-[#E5E7EB] px-4 py-2.5 font-['Poppins'] text-lg text-[#6B7280] cursor-not-allowed select-none">
                  {direccion.direccion || "Dirección no disponible"}
                </div>
                <p className="text-[11px] text-ustay-muted">La dirección no se puede modificar</p>
              </div>

              {/* Fotos — existentes + nuevas */}
              <div className="space-y-4">
                <h3 className="subtitulo text-texto">Fotos</h3>

                {/* Portada existente — siempre visible */}
                {portadaExistente && (
                  <div className="space-y-2">
                    <label className="subtitulo text-texto text-xs">Portada actual</label>
                    <div className="relative">
                      <img
                        src={obtenerUrlFoto(portadaExistente.url_foto)}
                        alt="Portada actual"
                        className={`w-full h-32 object-cover rounded-[18px] border transition-all ${
                          fotosAEliminar.includes(portadaExistente.id_foto)
                            ? "border-danger/50 opacity-40"
                            : "border-[#B6D5FE]"
                        }`}
                      />
                      {fotosAEliminar.includes(portadaExistente.id_foto) ? (
                        <>
                          <span className="absolute top-1.5 left-1.5 bg-danger/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Eliminada
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleEliminarFoto(portadaExistente.id_foto)}
                            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/90 text-[10px] font-semibold px-2.5 py-1 rounded-full text-danger border border-danger/40 hover:bg-white transition-colors"
                          >
                            Recuperar
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="absolute top-1.5 left-1.5 bg-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full text-ustay-text">
                            Portada
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleEliminarFoto(portadaExistente.id_foto)}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-danger text-white text-xs font-bold shadow hover:bg-danger-hover transition-colors"
                            title="Eliminar portada"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Fotos existentes adicionales */}
                {fotosExistentes.length > 0 && (
                  <div className="space-y-2">
                    <label className="subtitulo text-texto text-xs">
                      Fotos adicionales ({fotosExistentes.length - fotosAEliminar.filter(id => fotosExistentes.some(f => f.id_foto === id)).length}/4)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {fotosExistentes.map((foto) => {
                        const eliminada = fotosAEliminar.includes(foto.id_foto);
                        return (
                          <div key={foto.id_foto} className="relative">
                            <img
                              src={obtenerUrlFoto(foto.url_foto)}
                              alt="Foto actual"
                              className={`w-full h-28 object-cover rounded-[18px] border transition-all ${
                                eliminada
                                  ? "border-danger/50 opacity-40"
                                  : "border-[#B6D5FE]"
                              }`}
                            />
                            {eliminada ? (
                              <>
                                <span className="absolute top-1.5 left-1.5 bg-danger/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  Eliminada
                                </span>
                                <button
                                  type="button"
                                  disabled={!puedeRecuperarFoto}
                                  onClick={() => puedeRecuperarFoto && toggleEliminarFoto(foto.id_foto)}
                                  className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                                    puedeRecuperarFoto
                                      ? "bg-white/90 text-danger border-danger/40 hover:bg-white cursor-pointer"
                                      : "bg-gray-200/90 text-gray-400 border-gray-300 cursor-not-allowed"
                                  }`}
                                  title={puedeRecuperarFoto ? "Recuperar foto" : "Límite de 4 fotos alcanzado"}
                                >
                                  {puedeRecuperarFoto ? "Recuperar" : "Máx. 4"}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleEliminarFoto(foto.id_foto)}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-danger text-white text-xs font-bold shadow hover:bg-danger-hover transition-colors"
                                title="Eliminar foto"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <SubirFotos
                  portada={form.portada}
                  fotos={form.fotos}
                  onChangePortada={(file) => actualizar("portada", file)}
                  onChangeFotos={(fotos) => actualizar("fotos", fotos)}
                  maxFotos={maxFotosNuevas}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Precio mensual"
                  type="number"
                  value={form.precio}
                  onChange={(e) => actualizar("precio", e.target.value)}
                  placeholder="$ 0"
                  required
                />
                <InputField
                  label="Teléfono de contacto"
                  type="tel"
                  value={form.telefono}
                  onChange={handleTelefonoChange}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>

              <InputField
                label="Descripción"
                value={form.descripcion}
                onChange={(e) => actualizar("descripcion", e.target.value)}
                placeholder="Describe el lugar, detalle habitaciones, servicios incluidos..."
                textarea
                required
              />

              <div className="flex items-center gap-3">
                <label className="subtitulo text-texto">Permitir comentarios</label>
                <button
                  type="button"
                  onClick={() =>
                    actualizar("permitir_comentarios", !form.permitir_comentarios)
                  }
                  className={[
                    "relative w-12 h-6 rounded-full transition-colors",
                    form.permitir_comentarios
                      ? "bg-ustay-blue"
                      : "bg-slate-300",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      form.permitir_comentarios
                        ? "translate-x-6"
                        : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>

              <SelectorEtiquetas
                etiquetas={etiquetas}
                seleccionadas={form.etiquetas}
                onChange={(ids) => actualizar("etiquetas", ids)}
              />
            </div>

            <div className="space-y-4">
              <MapaPreview center={center} universidades={universidades} />

              {/* Alerta de re‑revisión solo si estaba activa/inactiva */}
              {publicacionData?.estado !== "pendiente" && publicacionData?.estado !== "eliminada" && (
                <div className="bg-edit-bg border border-edit/50 rounded-ustay-card p-4">
                  <p className="text-sm font-semibold text-edit">
                    Al guardar los cambios, la publicación deberá pasar por revisión nuevamente antes de activarse.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 rounded-full px-6 py-3 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#D1FAE5",
                    border: "2px solid #4CAF50",
                    color: "#166534",
                  }}
                >
                  {enviando ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/mis-publicaciones")}
                  disabled={enviando}
                  className="flex-1 rounded-full px-6 py-3 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "#FEE2E2",
                    border: "2px solid #991B1B",
                    color: "#991B1B",
                  }}
                >
                  Cancelar
                </button>
              </div>

              {error && Array.isArray(error) && error.length > 0 && (
                <div className="space-y-2">
                  {error.map((msg, i) => (
                    <div key={i} className="bg-danger-low border border-danger/30 rounded-ustay-card p-4">
                      <p className="text-sm text-danger font-medium">{msg}</p>
                    </div>
                  ))}
                </div>
              )}
              {error && !Array.isArray(error) && (
                <div className="bg-danger-low border border-danger/30 rounded-ustay-card p-4">
                  <p className="text-sm text-danger font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
          </Wrapper>
        </form>
      </main>

      <BarraInferior />
    </div>
  );
}
