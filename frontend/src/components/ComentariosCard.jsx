import { useEffect, useState } from "react";
import { getComentariosByPublicacion } from "../services/comentario.service.js";
import banderaSvg from "../assets/iconos/bandera.svg?raw";

function IconBandera({ className }) {
  const html = banderaSvg
    .replace(/^.*?(<svg)/i, "$1")
    .replace(/<svg/i, '<svg fill="currentColor"')
    .replace(/width="[^"]*"/, 'width="14"')
    .replace(/height="[^"]*"/, 'height="14"');
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

const COMENTARIOS_POR_PAGINA = 5;

export default function ComentariosCard({ idPublicacion, permitirComentarios }) {
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (!idPublicacion) return;

    async function cargarComentarios() {
      setCargando(true);
      setError(null);
      try {
        const data = await getComentariosByPublicacion(idPublicacion);
        setComentarios(Array.isArray(data) ? data : []);
        setPagina(1);
      } catch (err) {
        const msg = err?.response?.data?.message?.[0] || err.message || "Error al cargar comentarios";
        setError(Array.isArray(msg) ? msg[0] : msg);
      } finally {
        setCargando(false);
      }
    }

    cargarComentarios();
  }, [idPublicacion]);

  // Calcular página actual
  const totalPaginas = Math.max(1, Math.ceil(comentarios.length / COMENTARIOS_POR_PAGINA));
  const inicio = (pagina - 1) * COMENTARIOS_POR_PAGINA;
  const comentariosPagina = comentarios.slice(inicio, inicio + COMENTARIOS_POR_PAGINA);

  function irPagina(siguiente) {
    setPagina((prev) => {
      const nueva = prev + (siguiente ? 1 : -1);
      if (nueva < 1 || nueva > totalPaginas) return prev;
      return nueva;
    });
  }

  return (
    <div className="bg-[#F3F4F6] border border-[#B6D5FE] rounded-panel px-4 md:px-6 py-6 md:py-8 space-y-4">
      {/* Título */}
      <h3 className="subtitulo text-type-title flex items-center gap-2">
        Comentarios
        {!cargando && (
          <span className="text-sm font-normal text-type-body font-poppins">
            ({comentarios.length})
          </span>
        )}
      </h3>

      {/* Comentarios deshabilitados */}
      {!permitirComentarios && !cargando && (
        <p className="texto text-sm text-ustay-muted italic">
          Los comentarios están deshabilitados para esta publicación.
        </p>
      )}

      {/* Estado: cargando */}
      {cargando && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#B6D5FE] rounded-ustay-card p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Estado: error al cargar */}
      {error && !cargando && (
        <p className="texto text-sm text-danger">{error}</p>
      )}

      {/* Sin comentarios */}
      {!cargando && !error && permitirComentarios && comentarios.length === 0 && (
        <p className="texto text-sm text-ustay-muted">
          No hay comentarios aún.
        </p>
      )}

      {/* Lista de comentarios */}
      {!cargando && !error && comentarios.length > 0 && (
        <>
          <div className="space-y-3">
            {comentariosPagina.map((comentario) => (
              <div
                key={`${comentario.id_usuario}-${comentario.id_publicacion}`}
                className="bg-white border border-[#B6D5FE] rounded-ustay-card p-4 space-y-2"
              >
                {/* Fila superior: nombre + reporte */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-type-subtitle font-poppins">
                    {comentario.usuario?.nombre || "Usuario"}
                  </span>
                  <button
                    type="button"
                    title="Reportar comentario"
                    className="w-7 h-7 rounded-full bg-delete-bg border-2 border-delete text-delete flex items-center justify-center hover:bg-red-100 transition-colors active:scale-[0.98]"
                    onClick={() => {
                      // TODO: Implementar reporte de comentario
                    }}
                  >
                    <IconBandera className="w-[14px] h-[14px] flex items-center justify-center" />
                  </button>
                </div>

                {/* Texto del comentario */}
                <p className="texto text-sm text-type-body leading-relaxed break-words">
                  {comentario.texto}
                </p>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                disabled={pagina <= 1}
                onClick={() => irPagina(false)}
                className="text-sm font-semibold font-poppins px-4 py-1.5 rounded-full border border-[#B6D5FE] bg-white text-ustay-blue hover:bg-ustay-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-ustay-blue"
              >
                &lt; Anterior
              </button>

              <span className="text-sm text-ustay-muted font-poppins">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() => irPagina(true)}
                className="text-sm font-semibold font-poppins px-4 py-1.5 rounded-full border border-[#B6D5FE] bg-white text-ustay-blue hover:bg-ustay-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-ustay-blue"
              >
                Siguiente &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
