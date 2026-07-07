import { useState, useEffect, useRef } from "react";

const MAX_FOTOS = 4;
const FORMATOS_PERMITIDOS = ['.jpg', '.jpeg', '.png'];
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];

function PreviewFoto({ file, label, onRemove }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file || !preview) return null;

  return (
    <div className="relative group">
      <img
        src={preview}
        alt={label}
        className="w-full h-28 object-cover rounded-[18px] border border-[#B6D5FE]"
      />
      <span className="absolute top-1.5 left-1.5 bg-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full text-ustay-text">
        {label}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-danger text-white text-xs font-bold shadow hover:bg-danger-hover transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

function validarArchivo(file) {
  if (!file) return null;
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return 'Solo se permiten archivos .jpg, .jpeg y .png';
  }
  if (file.size > 30 * 1024 * 1024) {
    return 'La imagen supera el tamaño máximo de 30 MB';
  }
  return null;
}

export default function SubirFotos({
  portada,
  fotos = [],
  onChangePortada,
  onChangeFotos,
}) {
  const portadaRef = useRef(null);
  const [error, setError] = useState("");

  function handlePortadaChange(e) {
    const file = e.target.files?.[0] || null;
    const err = validarArchivo(file);
    if (err) {
      setError(err);
      e.target.value = "";
      return;
    }
    setError("");
    onChangePortada(file);
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validarArchivo(file);
    if (err) {
      setError(err);
      e.target.value = "";
      return;
    }

    if (fotos.length >= MAX_FOTOS) {
      setError(`Máximo ${MAX_FOTOS} fotos adicionales`);
      e.target.value = "";
      return;
    }

    setError("");
    onChangeFotos([...fotos, file]);
    e.target.value = "";
  }

  function quitarFoto(index) {
    onChangeFotos(fotos.filter((_, i) => i !== index));
  }

  function formatearTamanio(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      <h3 className="subtitulo text-sm">Fotos</h3>

      {/* Portada */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ustay-muted font-poppins">
          Portada *
        </label>
        <input
          ref={portadaRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handlePortadaChange}
          className="w-full rounded-[25px] border px-4 py-2.5 texto bg-[#F3F4F6] border-[#B6D5FE] file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-ustay-blue file:text-white file:text-xs file:font-semibold hover:file:bg-ustay-blue-dark transition-all cursor-pointer"
        />
        {portada && (
          <div className="relative">
            <PreviewFoto file={portada} label="Portada" onRemove={() => { onChangePortada(null); portadaRef.current.value = ""; }} />
            <p className="text-[10px] text-ustay-muted mt-1">
              {portada.name} — {formatearTamanio(portada.size)}
            </p>
          </div>
        )}
      </div>

      {/* Fotos adicionales */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ustay-muted font-poppins">
          Fotos adicionales {fotos.length > 0 && `(${fotos.length}/${MAX_FOTOS})`}
        </label>

        <div className="flex gap-2">
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFotoChange}
            disabled={fotos.length >= MAX_FOTOS}
            className="flex-1 rounded-[25px] border px-4 py-2.5 texto bg-[#F3F4F6] border-[#B6D5FE] file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-ustay-blue file:text-white file:text-xs file:font-semibold hover:file:bg-ustay-blue-dark transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {fotos.length >= MAX_FOTOS && (
          <p className="text-[10px] text-ustay-muted">
            Máximo {MAX_FOTOS} fotos adicionales alcanzado
          </p>
        )}

        {fotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {fotos.map((file, index) => (
              <div key={`${file.name}-${file.size}-${index}`}>
                <PreviewFoto file={file} label={`Foto ${index + 1}`} onRemove={() => quitarFoto(index)} />
                <p className="text-[10px] text-ustay-muted mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}
