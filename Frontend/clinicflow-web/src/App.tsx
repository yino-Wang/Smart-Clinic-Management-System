import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import { useAuth } from "./context/authContext";
import Layout from "./components/layout";
import Dashboard from "./pages/dashboard";
import Appointments from "./pages/appointments";
import NewAppointment from "./pages/newAppointment";
import Patients from "./pages/patients";
import NewPatient from "./pages/newPatient";
import EditPatient from "./pages/editPatient";
import Doctors from "./pages/doctors";
import NewDoctorPage from "./pages/newDoctorPage";
import EditDoctor from "./pages/editDoctor";
import Reports from "./pages/reports";
import Settings from "./pages/settings";
import UserDashboard from "./pages/userDashboard";
import MyAppointments from "./pages/myAppointments";
import { AdminRoute, PrivateRoute } from "./components/routeGuards";
import { ADMIN_DASHBOARD_ROUTE, ADMIN_PORTAL_PREFIX, USER_DASHBOARD_ROUTE, USER_PORTAL_PREFIX } from "./routes/paths";

export default function App() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const defaultPortal = (role || "").toLowerCase() === "admin" ? ADMIN_DASHBOARD_ROUTE : USER_DASHBOARD_ROUTE;

  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route path={ADMIN_PORTAL_PREFIX} element={<AdminShell />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/new" element={<NewAppointment />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<NewPatient />} />
        <Route path="patients/:id/edit" element={<EditPatient />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/new" element={<NewDoctorPage />} />
        <Route path="doctors/edit/:id" element={<EditDoctor />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path={USER_PORTAL_PREFIX} element={<UserShell />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="my-appointments" element={<MyAppointments />} />
        <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={defaultPortal} replace />} />
    </Routes>
  );
}

function AdminShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function UserShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}