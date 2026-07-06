import { useState } from "react";

function PreviewFoto({ url, label }) {
  if (!url || !url.trim()) return null;

  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="relative min-h-[112px] rounded-[18px] border border-[#B6D5FE] bg-slate-100 flex items-center justify-center">
        <span className="absolute top-1.5 left-1.5 bg-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full text-ustay-text">
          {label}
        </span>
        <p className="text-xs text-danger text-center px-4">
          URL inválida o imagen no disponible
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={url}
        alt={label}
        className="w-full h-28 object-cover rounded-[18px] border border-[#B6D5FE]"
        onError={() => setError(true)}
        onLoad={() => setError(false)}
      />
      <span className="absolute top-1.5 left-1.5 bg-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full text-ustay-text">
        {label}
      </span>
    </div>
  );
}

export default function SubirFotos({
  portada,
  fotos = [],
  onChangePortada,
  onChangeFotos,
}) {
  const [nuevaFoto, setNuevaFoto] = useState("");

  function agregarFoto() {
    const url = nuevaFoto.trim();
    if (!url) return;
    onChangeFotos([...fotos, url]);
    setNuevaFoto("");
  }

  function quitarFoto(index) {
    const siguientes = fotos.filter((_, i) => i !== index);
    onChangeFotos(siguientes);
  }

  return (
    <div className="space-y-4">
      <h3 className="subtitulo text-sm">Fotos</h3>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-ustay-muted font-poppins">
          Portada *
        </label>
        <input
          type="url"
          value={portada}
          onChange={(e) => onChangePortada(e.target.value)}
          placeholder="https://ejemplo.com/portada.jpg"
          className="w-full rounded-[25px] border px-4 py-2.5 texto bg-[#F3F4F6] border-[#B6D5FE] focus:outline-none focus:border-ustay-blue focus:ring-1 focus:ring-ustay-blue/30 transition-all"
        />
        <PreviewFoto url={portada} label="Portada" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-ustay-muted font-poppins">
          Fotos adicionales
        </label>

        <div className="flex gap-2">
          <input
            type="url"
            value={nuevaFoto}
            onChange={(e) => setNuevaFoto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarFoto();
              }
            }}
            placeholder="https://ejemplo.com/foto.jpg"
            className="flex-1 rounded-[25px] border px-4 py-2.5 texto bg-[#F3F4F6] border-[#B6D5FE] focus:outline-none focus:border-ustay-blue focus:ring-1 focus:ring-ustay-blue/30 transition-all"
          />
          <button
            type="button"
            onClick={agregarFoto}
            disabled={!nuevaFoto.trim()}
            className="px-4 py-2 rounded-full bg-ustay-blue text-white text-sm font-semibold hover:bg-ustay-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {fotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {fotos.map((url, index) => (
              <div key={index} className="relative group">
                <PreviewFoto url={url} label={`Foto ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => quitarFoto(index)}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-danger text-white text-xs font-bold shadow hover:bg-danger-hover transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
