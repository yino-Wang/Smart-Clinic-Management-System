import { createContext, useContext, useState, ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { getAppointments } from "../api/appointments";

interface AuthContextType {
    token: string | null;
    role: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  const [role, setRole] = useState<string | null>(() =>
    localStorage.getItem("role")
  );

    const login = (newToken: string, newRole: string) => {
        setToken(newToken);
        setRole(newRole);
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("role", newRole);
    }

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        setToken(null);
        setRole(null);
    }

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}