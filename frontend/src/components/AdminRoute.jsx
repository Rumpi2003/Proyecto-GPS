import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  // Mientras verifica el token en las cookies, mostramos algo vacío o un loader
  // para evitar que lo expulse por error al recargar la página
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Si no está logueado o su rol no es admin, lo devolvemos al inicio
  if (!isAuthenticated || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Si todo está correcto, renderizamos la página de administrador
  return children;
};