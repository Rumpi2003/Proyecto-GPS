import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated || role !== "administrador") {
    return <Navigate to="/" replace />;
  }

  return children;
};