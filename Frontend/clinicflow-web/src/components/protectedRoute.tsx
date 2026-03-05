import { ReactNode } from "react";
import { useAuth } from "../context/authContext";
import Login from "./login";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}