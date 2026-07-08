import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";
import Map from "./pages/Map.jsx";
import Home from "./pages/Home.jsx";
import CrearPublicacion from "./pages/CrearPublicacion.jsx";
import MisPublicaciones from "./pages/MisPublicaciones.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/publicar" element={<CrearPublicacion />} />
          <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
