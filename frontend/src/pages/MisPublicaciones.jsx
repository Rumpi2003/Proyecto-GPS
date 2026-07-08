import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BarraNavegacion } from "../components/BarraNavegacion.jsx";
import { BarraInferior } from "../components/BarraInferior.jsx";
import MisPublicacionesTarjeta from "../components/MisPublicacionesTarjeta.jsx";
import ModalConfirmacion from "../components/ModalConfirmacion.jsx";
import {
  getMisPublicaciones,
  toggleEstado,
  eliminarPublicacion,
} from "../services/publicacion.service.js";

export default function MisPublicaciones() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(new Set());

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/iniciar-sesion", { replace: true });
      return;
    }
    if (user?.rol === "registrado") {
      navigate("/", { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Fetch publications
  useEffect(() => {
    if (!user?.id) return;
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (user?.rol === "registrado") return;

    async function fetchData() {
      setCargando(true);
      setError("");
      try {
        const data = await getMisPublicaciones(user.id);
        setPublicaciones(Array.isArray(data) ? data : []);
      } catch {
        setError("Error al cargar publicaciones");
      } finally {
        setCargando(false);
      }
    }
    fetchData();
  }, [user?.id, authLoading, isAuthenticated, user?.rol]);

  // Optimistic toggle
  async function handleToggle(id_publicacion, nuevoEstado) {
    // Optimistic update
    setPublicaciones((prev) =>
      prev.map((p) =>
        p.id_publicacion === id_publicacion ? { ...p, estado: nuevoEstado } : p
      )
    );

    setToggleLoading((prev) => new Set(prev).add(id_publicacion));

    try {
      await toggleEstado(id_publicacion, nuevoEstado);
    } catch {
      // Revert on error
      const estadoAnterior = nuevoEstado === "activa" ? "inactiva" : "activa";
      setPublicaciones((prev) =>
        prev.map((p) =>
          p.id_publicacion === id_publicacion
            ? { ...p, estado: estadoAnterior }
            : p
        )
      );
    } finally {
      setToggleLoading((prev) => {
        const next = new Set(prev);
        next.delete(id_publicacion);
        return next;
      });
    }
  }

  // Delete confirmation
  function handleDeleteClick(id_publicacion, titulo) {
    setDeleteTarget({ id: id_publicacion, titulo });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await eliminarPublicacion(deleteTarget.id);
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // Keep the card, show error silently
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEdit(id_publicacion) {
    navigate(`/editar-publicacion/${id_publicacion}`);
  }

  // ---- Render helpers ----

  if (authLoading || cargando) {
    return (
      <main className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <div className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8">
          <h1 className="titulo mb-8">Mis Publicaciones</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-panel border border-slate-100 bg-white shadow-soft overflow-hidden animate-pulse flex flex-col sm:flex-row"
              >
                <div className="sm:w-44 sm:min-w-[11rem] h-48 sm:h-auto bg-slate-200" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-slate-200 rounded-full w-10" />
                    <div className="h-8 bg-slate-200 rounded-full w-10" />
                    <div className="h-8 bg-slate-200 rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BarraInferior />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <div className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col items-center justify-center gap-4">
          <p className="texto text-danger text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-ustay-blue text-white px-6 py-2.5 font-semibold hover:bg-ustay-blue-dark transition-all"
          >
            Reintentar
          </button>
        </div>
        <BarraInferior />
      </main>
    );
  }

  // Empty state
  if (publicaciones.length === 0) {
    return (
      <main className="flex flex-col min-h-screen">
        <BarraNavegacion />
        <div className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-ustay-bg flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-ustay-blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <p className="texto text-ustay-muted text-center max-w-sm">
            No posees ninguna publicación creada en la plataforma
          </p>
          <button
            onClick={() => navigate("/publicar")}
            className="rounded-full bg-ustay-blue text-white px-6 py-2.5 font-semibold hover:bg-ustay-blue-dark transition-all"
          >
            Crear publicación
          </button>
        </div>
        <BarraInferior />
      </main>
    );
  }

  // Success state
  return (
    <main className="flex flex-col min-h-screen">
      <BarraNavegacion />
      <div className="flex-grow max-w-[1440px] mx-auto w-full px-6 py-8 pb-24">
        <h1 className="titulo mb-8">Mis Publicaciones</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {publicaciones.map((pub) => (
            <MisPublicacionesTarjeta
              key={pub.id_publicacion}
              publicacion={pub}
              onToggle={handleToggle}
              onDelete={handleDeleteClick}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </div>

      <ModalConfirmacion
        isOpen={deleteTarget !== null}
        titulo={deleteTarget?.titulo ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <BarraInferior />
    </main>
  );
}
