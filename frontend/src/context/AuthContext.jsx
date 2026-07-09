import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import api from "../services/axios.config.js";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("jwt-auth");
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ id: decoded.id, rol: decoded.rol });
      } else {
        Cookies.remove("jwt-auth");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (correo, contraseña) => {
    const { data } = await api.post("/auth/login", { correo, contraseña });
    Cookies.set("jwt-auth", data.data.token, { expires: 1, path: "/" });
    const decoded = decodeJwt(data.data.token);
    setUser({ id: decoded.id, rol: decoded.rol });
    return data.data.usuario;
  }, []);

  const register = useCallback(async (datos) => {
    const { data } = await api.post("/auth/register", datos);
    Cookies.set("jwt-auth", data.data.token, { expires: 1, path: "/" });
    const decoded = decodeJwt(data.data.token);
    setUser({ id: decoded.id, rol: decoded.rol });
    return data.data.usuario;
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("jwt-auth");
    setUser(null);
  }, []);

  const updateToken = useCallback((token) => {
    Cookies.set("jwt-auth", token, { expires: 1, path: "/" });
    const decoded = decodeJwt(token);
    if (decoded) {
      setUser({ id: decoded.id, rol: decoded.rol });
    }
  }, []);

  const isAuthenticated = !!user;
  const role = user?.rol ?? null;

  return (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated,
          role,
          isLoading,
          login,
          register,
          logout,
          updateToken,
        }}
      >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
