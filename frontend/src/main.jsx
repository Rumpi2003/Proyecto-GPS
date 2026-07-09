import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminRoute } from "./components/AdminRoute.jsx"; // <-- 1. Importamos el guardia

import "./index.css";
import Map from "./pages/Map.jsx";
import Home from "./pages/Home.jsx";
import HomeAdmin from "./pages/HomeAdmin.jsx";
import SolicitudesPublicacion from "./pages/SolicitudesPublicacion.jsx";
import ReportePublicaciones from "./pages/reportePublicaciones.jsx";
import { ReporteComentarios } from "./pages/reporteComentario.jsx";
import CrearPublicacion from "./pages/CrearPublicacion.jsx";
import EditarPublicacion from "./pages/EditarPublicacion.jsx";
import MisPublicaciones from "./pages/MisPublicaciones.jsx";
import Publicacion from "./pages/Publicacion.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />

          <Route path="/publicar" element={<CrearPublicacion />} />
          <Route path="/editar-publicacion/:id" element={<EditarPublicacion />} />
          <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
          <Route path="/publicacion/:id_publicacion" element={<Publicacion />} />

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
                <SolicitudesPublicacion />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/reportes-publicaciones" 
            element={
              <AdminRoute>
                <ReportePublicaciones />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/reportes-comentarios" 
            element={
              <AdminRoute>
                <ReporteComentarios />
              </AdminRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);