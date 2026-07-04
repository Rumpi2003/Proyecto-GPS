import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const BarraNavegacion = () => {
    const navigate = useNavigate();
    // lógica para manejar la autenticación y el cierre de sesión
    // const { isAuthenticated, logout } = useAuth();
    const isAuthenticated = true; // Simulación de estado de autenticación
    
    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        // logout();
        navigate("/");
    };

    return (
        <nav className="bg-ustay-blue text-white shadow-lg">
            {/* Barra de navegación con el logo de U-STAY y el título "U-STAY" */}
            <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">

                {/* Logo de U-STAY */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black italic tracking-tighter select-none">
                        U-STAY
                    </span>
                </div>

                {/* Links y Botones */}
                <div className="flex items-center gap-8">
                    <ul className="hidden lg:flex items-center gap-6 text-sm font-medium">
                        <li>
                            <Link to="/universidades" className="hover:text-white/80 transition-colors">
                                Universidades
                            </Link>
                        </li>
                        <li>
                            <Link to="/publicar" className="hover:text-white/80 transition-colors">
                                Publicar
                            </Link>
                        </li>
                        <li>
                            <Link to="/mis-publicaciones" className="hover:text-white/80 transition-colors">
                                Mis Publicaciones
                            </Link>
                        </li>
                    </ul>

                    {/* Botón de inicio de sesión */}
                    {!isAuthenticated && (
                        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Iniciar sesión
                        </button>
                    )}
                    {isAuthenticated && (
                        <button onClick={handleLogout} className="flex items-center gap-2 bg-danger/15 hover:bg-danger/30 border border-danger/40 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-sm text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar sesión
                        </button>
                    )}
                </div>

            </div>
        </nav>
    );
}