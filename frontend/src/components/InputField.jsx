export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  textarea = false,
  required = false,
  maxLength,
  className = "",
}) {
  const baseClass =
    "w-full rounded-[25px] border px-4 py-2.5 texto bg-[#F3F4F6] border-[#B6D5FE] focus:outline-none focus:border-ustay-blue focus:ring-1 focus:ring-ustay-blue/30 transition-all";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="subtitulo text-texto block">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          maxLength={maxLength}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={baseClass}
        />
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
