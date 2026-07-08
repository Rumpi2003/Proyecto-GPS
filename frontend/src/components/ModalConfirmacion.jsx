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

export default function ModalConfirmacion({ isOpen, titulo, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-panel p-8 max-w-md w-full mx-4 border border-ustay-light-border shadow-xl"
      >
        <h3 className="titulo mb-2">¿Estás seguro de eliminar esta publicación?</h3>

        {titulo && (
          <p className="subtitulo mb-6">&ldquo;{titulo}&rdquo;</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-600 font-semibold texto text-sm hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-delete text-delete bg-delete-bg hover:bg-delete-bg-hover font-semibold texto text-sm transition-all"
          >
            <IconSvg svg={papeleraSvg} className="w-4 h-4 shrink-0 flex items-center justify-center" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
