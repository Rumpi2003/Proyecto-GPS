import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BarraNavegacion } from "../components/BarraNavegacion.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";
import InputField from "../components/InputField.jsx";
import BuscadorDireccion from "../components/BuscadorDireccion.jsx";
import SubirFotos from "../components/SubirFotos.jsx";
import SelectorEtiquetas from "../components/SelectorEtiquetas.jsx";
import MapaPreview from "../components/MapaPreview.jsx";
import { getEtiquetas } from "../services/etiqueta.service.js";
import { getUniversidades } from "../services/universidad.service.js";
import { createPublicacion } from "../services/publicacion.service.js";
import { Wrapper } from "@googlemaps/react-wrapper";

export default function CrearPublicacion() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [etiquetas, setEtiquetas] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    telefono: "",
    permitir_comentarios: true,
    portada: "",
    fotos: [],
    etiquetas: [],
  });

  const [direccion, setDireccion] = useState({
    place_id: "",
    direccion: "",
    lat: null,
    lng: null,
  });

  useEffect(() => {
    async function cargar() {
      try {
        const [etiquetasData, universidadesData] = await Promise.all([
          getEtiquetas(),
          getUniversidades(),
        ]);
        setEtiquetas(Array.isArray(etiquetasData) ? etiquetasData : []);
        setUniversidades(Array.isArray(universidadesData) ? universidadesData : []);
      } catch {
        setError("Error al cargar datos iniciales");
      }
    }
    cargar();
  }, []);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handlePlaceSelect({ place_id, direccion: dir, lat, lng }) {
    setDireccion({ place_id, direccion: dir, lat, lng });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!direccion.place_id) {
      setError("Seleccioná una dirección válida de las sugerencias");
      return;
    }

    if (!form.portada.trim()) {
      setError("Agregá una URL de foto de portada");
      return;
    }

    setEnviando(true);

    try {
      await createPublicacion({
        place_id: direccion.place_id,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        telefono: form.telefono.trim(),
        permitir_comentarios: form.permitir_comentarios,
        url_portada: form.portada.trim(),
        url_fotos: form.fotos.filter((f) => f.trim()),
        etiquetas: form.etiquetas,
      });

      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Error al crear la publicación";
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  const center =
    direccion.lat != null && direccion.lng != null
      ? { lat: direccion.lat, lng: direccion.lng }
      : null;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#DBEAFE]">
        <BarraNavegacion />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-panel shadow-soft p-8 max-w-md text-center border border-[#B6D5FE]">
            <h2 className="titulo mb-2">Iniciá sesión</h2>
            <p className="texto text-sm text-ustay-muted mb-4">
              Necesitás una cuenta registrada para publicar arriendos.
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

  return (
    <div className="flex flex-col min-h-screen bg-[#DBEAFE]">
      <BarraNavegacion />

      <main className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-28">

        <form onSubmit={handleSubmit}>
          <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]} render={(status) => <div>{status}</div>}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 items-start">
            <div className="bg-[#F3F4F6] border border-[#B6D5FE] rounded-panel p-6 md:p-8 space-y-5">
              <h1 className="titulo">Publicar arriendo</h1>
              <InputField
                label="Título"
                value={form.titulo}
                onChange={(e) => actualizar("titulo", e.target.value)}
                placeholder="Ej: Departamento amoblado cerca de la UBB"
                required
              />

              <BuscadorDireccion onPlaceSelect={handlePlaceSelect} />

              <SubirFotos
                portada={form.portada}
                fotos={form.fotos}
                onChangePortada={(url) => actualizar("portada", url)}
                onChangeFotos={(fotos) => actualizar("fotos", fotos)}
              />

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
                  onChange={(e) => actualizar("telefono", e.target.value)}
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
                <label className="subtitulo text-sm">Permitir comentarios</label>
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
                  {enviando ? "Publicando..." : "Crear publicación"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={enviando}
                  className="flex-1 rounded-full px-6 py-3 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "#FEE2E2",
                    border: "2px solid #FEE2E2",
                    color: "#991B1B",
                  }}
                >
                  Cancelar
                </button>
              </div>

              {error && (
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
