import { useMemo } from "react";

export default function SelectorEtiquetas({
  etiquetas = [],
  seleccionadas = [],
  onChange,
}) {
  const categorias = useMemo(() => {
    return Object.values(
      etiquetas.reduce((acc, etiqueta) => {
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
      }, {})
    );
  }, [etiquetas]);

  function toggleEtiqueta(idEtiqueta, esExcluyente) {
    let siguientes;

    if (esExcluyente) {
      const idsEnCategoria = categorias
        .find((c) => c.etiquetas.some((e) => e.id_etiqueta === idEtiqueta))
        ?.etiquetas.map((e) => e.id_etiqueta) ?? [];

      const tieneOtraSeleccionada = seleccionadas.some((id) =>
        idsEnCategoria.includes(id)
      );

      if (tieneOtraSeleccionada) {
        siguientes = seleccionadas.filter(
          (id) => !idsEnCategoria.includes(id)
        );
      } else {
        siguientes = [...seleccionadas, idEtiqueta];
      }
    } else {
      const existe = seleccionadas.includes(idEtiqueta);
      siguientes = existe
        ? seleccionadas.filter((id) => id !== idEtiqueta)
        : [...seleccionadas, idEtiqueta];
    }

    onChange(siguientes);
  }

  return (
    <div className="space-y-4">
      <h3 className="subtitulo text-sm">Etiquetas</h3>

      {categorias.length === 0 && (
        <p className="text-xs text-ustay-muted">Cargando etiquetas...</p>
      )}

      <div className="space-y-3">
        {categorias.map((categoria) => (
          <div key={categoria.id_categoria}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-ustay-text font-poppins">
                {categoria.nombre_categoria}
              </span>
              {categoria.es_excluyente && (
                <span className="text-[10px] text-ustay-muted">
                  (selección única)
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categoria.etiquetas.map((etiqueta) => {
                const checked = seleccionadas.includes(etiqueta.id_etiqueta);
                return (
                  <button
                    key={etiqueta.id_etiqueta}
                    type="button"
                    onClick={() =>
                      toggleEtiqueta(
                        etiqueta.id_etiqueta,
                        categoria.es_excluyente
                      )
                    }
                    className={[
                      "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all",
                      checked
                        ? "bg-ustay-light-border text-white border-ustay-blue"
                        : "bg-white text-slate-700 border-slate-200 hover:border-ustay-blue/40 hover:text-ustay-blue",
                    ].join(" ")}
                  >
                    {etiqueta.nombreEtiqueta}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
