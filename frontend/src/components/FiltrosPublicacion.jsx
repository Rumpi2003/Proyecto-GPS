export default function FiltrosPublicacion({
  universidades = [],
  universidadSeleccionada,
  etiquetas = [],
  filtros,
  onChangeFiltros,
  onChangeUniversidad,
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

    const siguientes = existe
      ? actual.filter((id) => id !== idEtiqueta)
      : [...actual, idEtiqueta];

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
          <option value="">Selecciona una universidad</option>
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
        <label className="block texto text-sm mb-2">Valoración mínima</label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={filtros.valoracion_min}
          onChange={(e) =>
            onChangeFiltros({
              ...filtros,
              valoracion_min: e.target.value,
            })
          }
          className="w-full rounded-ustay-card border border-slate-200 px-3 py-2"
        />
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
                      <span className="text-sm">{etiqueta.nombreEtiqueta}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}