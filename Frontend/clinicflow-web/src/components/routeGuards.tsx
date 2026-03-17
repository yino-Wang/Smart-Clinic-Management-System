import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ADMIN_DASHBOARD_ROUTE, USER_DASHBOARD_ROUTE } from "../routes/paths";

export function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if ((role || "").toLowerCase() !== "admin") {
    return <Navigate to={USER_DASHBOARD_ROUTE} replace />;
  }

  return <Outlet />;
}

export function RedirectToPortal() {
  const { role } = useAuth();
  const target = (role || "").toLowerCase() === "admin" ? ADMIN_DASHBOARD_ROUTE : USER_DASHBOARD_ROUTE;
  return <Navigate to={target} replace />;
}
