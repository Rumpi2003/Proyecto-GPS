function obtenerPortada(publicacion) {
  const portada = publicacion.fotos?.find((foto) => foto.es_portada);
  return portada?.url_foto ?? publicacion.fotos?.[0]?.url_foto ?? "";
}

function obtenerDistancia(publicacion, universidadId) {
  const cercania = publicacion.cercanias?.find(
    (c) => String(c.id_universidad) === String(universidadId)
  );

  return cercania?.distancia_metros ?? null;
}

function formatearPrecio(precio) {
  const valor = Number(precio ?? 0);
  return valor.toLocaleString("es-CL");
}


export default function TarjetaPublicacion({
  publicacion,
  universidadId,
  activa = false,
  onClick,
}) {
  const portada = obtenerPortada(publicacion);
  const distancia = obtenerDistancia(publicacion, universidadId);
  const etiquetas = publicacion.etiquetas ?? [];
  const visibles = etiquetas.slice(0, 4);
  const extras = etiquetas.length - visibles.length;

  function limitarTexto(texto, maxCaracteres = 60) {
    const valor = String(texto ?? "");
    return valor.length > maxCaracteres
      ? `${valor.slice(0, maxCaracteres).trimEnd()}...`
      : valor;
  }

  return (
    <article
      onClick={onClick}
      className={[
        "cursor-pointer rounded-panel border bg-white shadow-soft overflow-hidden transition-all",
        activa
          ? "border-ustay-blue ring-2 ring-ustay-blue/30"
          : "border-slate-100 hover:border-ustay-blue/30 hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
        <div className="h-44 md:h-full min-h-[180px] bg-slate-100">
          <img
            src={portada}
            alt={publicacion.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start gap-4 w-full overflow-hidden">
            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="titulo text-[22px]">{limitarTexto(publicacion.titulo, 30)}</h3>
            </div>

            <div className="shrink-0 rounded-full bg-ustay-bg px-3 py-1 text-sm font-semibold text-ustay-blue">
              {publicacion.promedio_valoracion ?? 0}
            </div>
          </div>

          <p className="texto text-sm">
            A {distancia != null ? `${distancia} m` : "Sin dato"} de la universidad
          </p>

          <div className="inline-flex items-center w-fit rounded-full bg-emerald-100 px-3 py-1">
            <p className="text-lg font-bold text-emerald-700">
                ${formatearPrecio(publicacion.precio)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibles.map((etiqueta) => (
              <span
                key={etiqueta.id_etiqueta}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 whitespace-nowrap"
              >
                <img
                    src={etiqueta.url_icono}
                    alt={etiqueta.nombreEtiqueta}
                    className="block w-4 h-4 object-contain shrink-0"
                />
                <span>{etiqueta.nombreEtiqueta}</span>
              </span>
            ))}

            {extras > 0 && (
              <span className="rounded-full bg-ustay-blue/10 px-3 py-1 text-xs font-semibold text-ustay-blue">
                +{extras}
              </span>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}