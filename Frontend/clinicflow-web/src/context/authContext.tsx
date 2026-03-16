import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { logoutSession } from "../api/auth";

interface AuthContextType {
  token: string | null;
  role: string | null;
  username: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("role"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));

  const persistUsername = (value: string | null) => {
    if (value) {
      localStorage.setItem("username", value);
    } else {
      localStorage.removeItem("username");
    }
  };

  const decodeUsername = (jwt: string | null) => {
    if (!jwt) return null;
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload?.unique_name ?? payload?.name ?? payload?.sub ?? null;
    } catch {
      return null;
    }
  };

  const login = (newToken: string, newRole: string) => {
    const derivedUsername = decodeUsername(newToken);
    setToken(newToken);
    setRole(newRole);
    setUsername(derivedUsername);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("role", newRole);
    persistUsername(derivedUsername);
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const logout = () => {
    logoutSession().catch(() => undefined);
    clearSession();
  };

  useEffect(() => {
    if (token && !username) {
      const derived = decodeUsername(token);
      setUsername(derived);
      persistUsername(derived);
    }
  }, [token, username]);

  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({ token, role, username, login, logout, isAuthenticated }),
    [token, role, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}