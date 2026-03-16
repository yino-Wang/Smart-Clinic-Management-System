import { Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/new" element={<NewAppointment />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/new" element={<NewPatient />} />
        <Route path="/patients/:id/edit" element={<EditPatient />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/new" element={<NewDoctorPage />} />
        <Route path="/doctors/edit/:id" element={<EditDoctor />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}