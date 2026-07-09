import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom"; // <-- Importamos useNavigate

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate(); // <-- Inicializamos el hook
  const [mode, setMode] = useState("login");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode("login");
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setNombre("");
    setCorreo("");
    setContraseña("");
    setError("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      let usuarioLogueado;

      if (mode === "login") {
        usuarioLogueado = await login(correo, contraseña);
      } else {
        usuarioLogueado = await register({ nombre, correo, contraseña });
      }

      resetForm();
      onClose();

      // Preferir el rol devuelto por la llamada (inmediato). Si no está, usar el contexto.
      const rol = usuarioLogueado?.rol ?? user?.rol;
      if (rol === "administrador") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[25px] p-8 max-w-md w-full mx-4 border border-[#B6D5FE] shadow-xl relative"
      >
        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ustay-muted hover:text-ustay-text text-xl leading-none"
        >
          ×
        </button>

        <h2 className="titulo text-center mb-6">
          {mode === "login" ? "Inicia sesión" : "Regístrate"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <p className="subtitulo">Nombre:</p>
              <input
                type="text"
                placeholder="ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="rounded-[25px] border border-gray-300 px-4 py-2 texto w-full focus:outline-none focus:border-ustay-blue"
              />
            </>
          )}

          <p className="subtitulo">Correo:</p>
          <input
            type="email"
            placeholder="ingresa tu correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="rounded-[25px] border border-gray-300 px-4 py-2 texto w-full focus:outline-none focus:border-ustay-blue"
          />

          <p className="subtitulo">Contraseña:</p>
          <input
            type="password"
            placeholder="••••••••"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            className="rounded-[25px] border border-gray-300 px-4 py-2 texto w-full focus:outline-none focus:border-ustay-blue"
          />

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <p className="texto text-center text-ustay-muted">
            {mode === "login" ? (
              <>
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-ustay-blue hover:underline font-semibold"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-ustay-blue hover:underline font-semibold"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ustay-blue text-white rounded-full px-6 py-3 font-semibold hover:bg-ustay-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Cargando..."
              : mode === "login"
                ? "Iniciar sesión"
                : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
};