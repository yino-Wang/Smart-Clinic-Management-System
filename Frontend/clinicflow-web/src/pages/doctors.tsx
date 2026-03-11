import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Doctor, getDoctors, deleteDoctor } from "../api/doctor";
import Topbar from "../components/topbar";

export default function DoctorsPage() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this doctor?");
    if (!confirmed) return;

    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
    } catch (err) {
      console.error("Failed to delete doctor:", err);
      alert("Failed to delete doctor.");
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "32px", overflowY: "auto" }}>
        <p style={{ color: "#64748b" }}>Loading doctors...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <Topbar 
        title="Doctors" 
        description="Manage doctor information, specialty, and profile photo." 
        extra={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              onClick={loadDoctors} 
              style={{ backgroundColor: "#f8fafc", color: "#4e4376", padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" }}
            >
              Refresh
            </button>
            <button 
              style={{ background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", border: "none", fontWeight: 600, fontSize: "14px", display: "inline-block", boxShadow: "0 2px 4px rgba(43,88,118,0.2)", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => navigate("/doctors/new")}
            >
              + Add Doctor
            </button>
          </div>
        }
      />

      <div style={{ padding: "32px", maxWidth: "1200px" }}>
        {error && (
          <p style={{ color: "crimson", background: "#fee2e2", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", marginBottom: "24px" }}>
            {error}
          </p>
        )}

        {/* table */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Segoe UI, sans-serif" }}>
            <thead>
              <tr>
                {["Photo", "Name", "Specialty", "Phone", "Email", "Availability", "Notes", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(to right, #f8fafc, #f1f5f9)", color: "#2b5876", fontWeight: 700, fontSize: "14px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <tr key={doctor.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                    {/* photo */}
                    <td style={{ padding: "16px" }}>
                      <img
                        src={
                          doctor.photoUrl?.trim()
                            ? doctor.photoUrl
                            : "https://via.placeholder.com/80x80?text=Doctor"
                        }
                        alt={doctor.name}
                        style={{ height: "56px", width: "56px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0" }}
                      />
                    </td>

                    {/* Name */}
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                      {doctor.name}
                    </td>

                    {/* Specialty */}
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "4px", background: "#f1f5f9", fontSize: "12px", fontWeight: 500, color: "#475569" }}>
                        {doctor.specialty || "-"}
                      </span>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>
                      {doctor.phone || "-"}
                    </td>

                    {/* Email */}
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>
                      {doctor.email || "-"}
                    </td>

                    {/* Availability */}
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>
                      {doctor.availability || "-"}
                    </td>

                    {/* Notes */}
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doctor.notes || "-"}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
                          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", color: "#2b5876", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(doctor.id)}
                          style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}