export default function FiltrosPublicacion({
  universidades = [],
  universidadSeleccionada,
  etiquetas = [],
  filtros,
  onChangeFiltros,
  onChangeUniversidad,
  onAplicarFiltros,
  onLimpiarFiltros,
}) {
  const categorias = etiquetas.reduce((acc, etiqueta) => {
    const categoria = etiqueta.categoria;
    if (!categoria) return acc;

    const key = categoria.id_categoria;
    if (!acc[key]) {
      acc[key] = {
        id_categoria: key,
        nombre_categoria: categoria.nombre_categoria,
        es_excluyente: categoria.es_excluyente,
        etiquetas: [],
      };
    }

    acc[key].etiquetas.push(etiqueta);
    return acc;
  }, {});

  function toggleEtiqueta(idEtiqueta) {
    const actual = filtros.ids_etiquetas ?? [];
    const existe = actual.includes(idEtiqueta);

    // Mapa id_etiqueta -> etiqueta completa (con categoria)
    const etiquetaPorId = new Map(etiquetas.map((e) => [e.id_etiqueta, e]));
    const etiquetaObjetivo = etiquetaPorId.get(idEtiqueta);

    if (!etiquetaObjetivo) return;

    const categoriaObjetivo = etiquetaObjetivo.categoria;
    const esExcluyente = Boolean(categoriaObjetivo?.es_excluyente);
    const idCategoriaObjetivo = categoriaObjetivo?.id_categoria;

    let siguientes = actual;

    // Si la categoría es excluyente, primero removemos cualquier etiqueta
    // ya seleccionada de esa misma categoría.
    if (esExcluyente && idCategoriaObjetivo != null) {
        siguientes = actual.filter((id) => {
        const e = etiquetaPorId.get(id);
        return e?.categoria?.id_categoria !== idCategoriaObjetivo;
        });
    }

    // Comportamiento toggle normal:
    // - si ya estaba seleccionada, la quitamos
    // - si no estaba, la agregamos
    if (existe) {
        siguientes = siguientes.filter((id) => id !== idEtiqueta);
    } else {
        siguientes = [...siguientes, idEtiqueta];
    }

    onChangeFiltros({
        ...filtros,
        ids_etiquetas: siguientes,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="titulo text-[24px] mb-4">Filtros</h2>

        <label className="block texto text-sm mb-2">Universidad cercana</label>
        <select
          className="w-full rounded-ustay-card border border-slate-200 px-3 py-2 bg-white"
          value={universidadSeleccionada?.id_universidad ?? ""}
          onChange={(e) => onChangeUniversidad(e.target.value)}
        >
          {universidades.map((uni) => (
            <option key={uni.id_universidad} value={uni.id_universidad}>
              {uni.nombre_universidad}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block texto text-sm mb-2">
          Distancia máxima: {filtros.distancia_max} m
        </label>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          value={filtros.distancia_max}
          onChange={(e) =>
            onChangeFiltros({
              ...filtros,
              distancia_max: Number(e.target.value),
            })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="block texto text-sm mb-2">Precio máximo</label>
        <input
          type="number"
          min="0"
          value={filtros.precio_max}
          onChange={(e) =>
            onChangeFiltros({
              ...filtros,
              precio_max: e.target.value,
            })
          }
          className="w-full rounded-ustay-card border border-slate-200 px-3 py-2"
        />
      </div>

      <div>
        <label className="block texto text-sm mb-2">
            Valoración mínima: {Number(filtros.valoracion_min ?? 0).toFixed(1)}
        </label>
        <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filtros.valoracion_min ?? 0}
            onChange={(e) =>
                onChangeFiltros({
                    ...filtros,
                    valoracion_min: Number(e.target.value),
                })
            }
            className="w-full"
            />
            <div className="flex justify-between text-xs text-ustay-muted mt-1">
                <span>0</span>
                <span>5</span>
            </div>
        </div>

      <div>
        <h3 className="subtitulo text-[18px] mb-3">Etiquetas</h3>

        <div className="space-y-4">
          {Object.values(categorias).map((categoria) => (
            <div key={categoria.id_categoria} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ustay-text">
                  {categoria.nombre_categoria}
                </p>
                <span className="text-xs text-ustay-muted">
                  {categoria.es_excluyente ? "Excluyente" : "Libre"}
                </span>
              </div>

              <div className="grid gap-2">
                {categoria.etiquetas.map((etiqueta) => {
                  const checked = (filtros.ids_etiquetas ?? []).includes(
                    etiqueta.id_etiqueta
                  );

                  return (
                    <label
                      key={etiqueta.id_etiqueta}
                      className="flex items-center gap-2 rounded-ustay-card border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEtiqueta(etiqueta.id_etiqueta)}
                      />

                      <img
                        src={etiqueta.url_icono}
                        alt={etiqueta.nombreEtiqueta}
                        className="w-5 h-5 object-contain shrink-0"
                      />

                      <span className="text-sm">{etiqueta.nombreEtiqueta}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex gap-2">
            <button
                type="button"
                onClick={onAplicarFiltros}
                className="flex-1 rounded-ustay-card bg-ustay-blue text-white font-semibold py-2.5 hover:bg-ustay-blue-dark transition-colors"
            >
                Filtrar
            </button>

            <button
                type="button"
                onClick={onLimpiarFiltros}
                className="rounded-ustay-card border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
            >
                Limpiar
            </button>
        </div>
      </div>
    </div>
  );
}