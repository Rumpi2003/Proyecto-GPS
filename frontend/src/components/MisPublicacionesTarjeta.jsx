import lapizSvg from "../assets/iconos/pencil.svg?raw";
import papeleraSvg from "../assets/iconos/papelera.svg?raw";

function IconSvg({ svg, className }) {
  const html = svg
    .replace(/fill="#000000"/g, 'fill="currentColor"')
    .replace(/width="[^"]*"/, 'width="16"')
    .replace(/height="[^"]*"/, 'height="16"');
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function obtenerUrlFoto(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = import.meta.env.VITE_API_URL || "";
  const apiBase = base.replace(/\/api\/?$/, "");
  return apiBase ? `${apiBase}${url}` : url;
}

function obtenerPortada(publicacion) {
  const portada = publicacion.fotos?.find((foto) => foto.es_portada);
  const url = portada?.url_foto ?? publicacion.fotos?.[0]?.url_foto ?? "";
  return obtenerUrlFoto(url);
}

function obtenerDistanciaMasCercana(cercanias) {
  if (!cercanias || cercanias.length === 0) return null;
  return cercanias.reduce((min, c) =>
    c.distancia_metros < min.distancia_metros ? c : min
  , cercanias[0]);
}

function formatearPrecio(precio) {
  const valor = Number(precio ?? 0);
  return valor.toLocaleString("es-CL");
}

export default function MisPublicacionesTarjeta({ publicacion, onToggle, onDelete, onEdit }) {
  const urlPortada = obtenerPortada(publicacion);
  const cercaniaMasCercana = obtenerDistanciaMasCercana(publicacion.cercanias);
  const distancia = cercaniaMasCercana?.distancia_metros ?? null;
  const nombreUniversidad = cercaniaMasCercana?.universidad?.nombre_universidad ?? null;
  const esPendiente = publicacion.estado === "pendiente";
  const esEliminada = publicacion.estado === "eliminada";
  const esActiva = publicacion.estado === "activa";

  return (
    <article className="rounded-panel border border-slate-100 bg-white shadow-soft overflow-hidden flex flex-col sm:flex-row">
      {/* Cover image — left side */}
      <div className="sm:w-44 sm:min-w-[11rem] h-48 sm:h-auto bg-slate-100">
        <img
          src={urlPortada}
          alt={publicacion.titulo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content — right side */}
      <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">
        {/* Title + rating */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="titulo text-[20px] leading-tight truncate">{publicacion.titulo}</h3>
          <span className="shrink-0 rounded-full bg-ustay-bg border border-ustay-light-border px-3 py-0.5 text-xs font-semibold text-ustay-blue">
            {publicacion.promedio_valoracion ?? 0}/5
          </span>
        </div>

        {/* Distance + price row */}
        <div className="flex items-center justify-between gap-2">
          {distancia != null ? (
            <span className="texto text-sm">{distancia} m</span>
          ) : (
            <span className="texto text-sm text-ustay-muted">Sin distancia</span>
          )}
          <span className="subtitulo text-sm font-bold shrink-0">
            ${formatearPrecio(publicacion.precio)}
          </span>
        </div>

        {/* Nearest university */}
        {distancia != null && nombreUniversidad && (
          <span className="texto text-xs text-ustay-muted -mt-1">{nombreUniversidad}</span>
        )}

        {/* Action buttons */}
        {!esPendiente && !esEliminada && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onEdit(publicacion.id_publicacion)}
              className="flex items-center gap-1.5 rounded-full border border-edit text-edit bg-edit-bg hover:bg-edit-bg-hover px-3 py-1.5 text-xs font-semibold transition-all"
            >
              <IconSvg svg={lapizSvg} className="w-4 h-4 shrink-0 flex items-center justify-center" />
              Editar
            </button>
            <button
              onClick={() => onDelete(publicacion.id_publicacion, publicacion.titulo)}
              className="flex items-center gap-1.5 rounded-full border border-delete text-delete bg-delete-bg hover:bg-delete-bg-hover px-3 py-1.5 text-xs font-semibold transition-all"
            >
              <IconSvg svg={papeleraSvg} className="w-4 h-4 shrink-0 flex items-center justify-center" />
              Eliminar
            </button>
          </div>
        )}

        {/* Bottom row: estado badge or toggle */}
        <div className="mt-auto pt-1">
          {esEliminada ? (
            <span className="inline-block rounded-full bg-delete-bg text-delete px-4 py-1.5 text-xs font-semibold">
              Eliminada
            </span>
          ) : esPendiente ? (
            <span className="inline-block rounded-full bg-amber-100 text-amber-800 px-4 py-1.5 text-xs font-semibold">
              En revisión
            </span>
          ) : (
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              {/* Toggle switch */}
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={esActiva}
                  onChange={() => onToggle(publicacion.id_publicacion, esActiva ? "inactiva" : "activa")}
                />
                <div className="w-11 h-6 bg-slate-300 rounded-full transition-colors peer-checked:bg-ustay-blue after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
              </div>
              <span className={`text-sm font-semibold ${esActiva ? "text-ustay-blue" : "text-slate-500"}`}>
                {esActiva ? "Habilitada" : "Deshabilitada"}
              </span>
            </label>
          )}
        </div>
      </div>
    </article>
  );
}
