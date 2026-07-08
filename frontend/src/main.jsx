import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminRoute } from "./components/AdminRoute.jsx"; // <-- 1. Importamos el guardia

import "./index.css";
import Map from "./pages/Map.jsx";
import Home from "./pages/Home.jsx";
import HomeAdmin from "./pages/HomeAdmin.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          
          {/* Rutas Privadas del Administrador */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <HomeAdmin />
              </AdminRoute>
            } 
          />
          
          {/* Vistas temporales (placeholders) también protegidas */}
          <Route 
            path="/admin/solicitudes" 
            element={
              <AdminRoute>
                <div className="p-8">Vista de Solicitudes de Publicación (Próximamente)</div>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/reportes-publicaciones" 
            element={
              <AdminRoute>
                <div className="p-8">Vista de Reportes de Publicaciones (Próximamente)</div>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/reportes-comentarios" 
            element={
              <AdminRoute>
                <div className="p-8">Vista de Reportes de Comentarios (Próximamente)</div>
              </AdminRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);