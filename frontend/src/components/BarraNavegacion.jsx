import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthModal } from "./AuthModal.jsx";

export const BarraNavegacion = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-ustay-blue text-white shadow-lg">
      {/* Barra de navegación con el logo de U-STAY y el título "U-STAY" */}
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo y menú hamburguesa */}
        <div className="flex items-center gap-2">
          {/* Botón menú hamburguesa — solo visible en mobile */}
          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-3 py-2 rounded-full text-sm text-white font-semibold transition-all active:scale-95 shadow-sm"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Menú desplegable mobile */}
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-ustay-blue border border-white/20 rounded-xl shadow-xl py-2 z-50">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 texto text-sm text-white hover:bg-white/10 transition-colors rounded-lg"
                >
                  Universidades
                </Link>
                {(role === "registrado" ||
                  role === "publicante" ||
                  role === "administrador") && (
                  <Link
                    to="/publicar"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 texto text-sm text-white hover:bg-white/10 transition-colors rounded-lg"
                  >
                    Publicar
                  </Link>
                )}
                {(role === "publicante" || role === "administrador") && (
                  <Link
                    to="/mis-publicaciones"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 texto text-sm text-white hover:bg-white/10 transition-colors rounded-lg"
                  >
                    Mis Publicaciones
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Logo U-STAY */}
          <span className="text-2xl font-black italic tracking-tighter select-none">
            U-STAY
          </span>
        </div>

        {/* Links desktop y Botones de auth */}
        <div className="flex items-center gap-8">
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <li>
              <Link
                to="/"
                className="texto text-white hover:text-white/80 transition-colors"
              >
                Universidades
              </Link>
            </li>
            {(role === "registrado" ||
              role === "publicante" ||
              role === "administrador") && (
              <li>
                <Link
                  to="/publicar"
                  className="texto text-white hover:text-white/80 transition-colors"
                >
                  Publicar
                </Link>
              </li>
            )}
            {(role === "publicante" || role === "administrador") && (
              <li>
                <Link
                  to="/mis-publicaciones"
                  className="texto text-white hover:text-white/80 transition-colors"
                >
                  Mis Publicaciones
                </Link>
              </li>
            )}
          </ul>

          {/* Botón de inicio de sesión */}
          {!isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-5 py-2 rounded-full texto text-sm text-white font-semibold transition-all active:scale-95 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Iniciar sesión
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-danger/15 hover:bg-danger/30 border border-danger/40 px-5 py-2 rounded-full texto text-sm text-white font-semibold transition-all active:scale-95 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
};
