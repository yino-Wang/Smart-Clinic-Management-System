import { useEffect, useMemo, useState } from "react";
import { getPatients, Patient } from "../api/patients";
import Topbar from "../components/topbar";
import { useNavigate } from "react-router-dom";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  async function loadPatients() {
    try {
      setLoading(true);
      setError("");
      const data = await getPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load patients:", err);
      setError("Failed to load patients.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return patients;

    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(keyword) ||
        patient.phone.toLowerCase().includes(keyword) ||
        patient.email.toLowerCase().includes(keyword) ||
        patient.gender.toLowerCase().includes(keyword)
      );
    });
  }, [patients, search]);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <Topbar 
        title="Patients" 
        description="Manage patient records and contact information." 
        extra={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              onClick={loadPatients} 
              style={{ backgroundColor: "#f8fafc", color: "#4e4376", padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" }}
            >
              Refresh
            </button>
            <button 
              style={{ background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", border: "none", fontWeight: 600, fontSize: "14px", display: "inline-block", boxShadow: "0 2px 4px rgba(43,88,118,0.2)", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => navigate("/patients/new")}
            >
              + New Patient
            </button>
          </div>
        }
      />

      <div style={{ padding: "32px", maxWidth: "1200px" }}>
        
        {/* Search */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search by name, phone, email, or gender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", maxWidth: "400px", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#1e293b", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          />
        </div>

        {/* States */}
        {loading && (
          <p style={{ color: "#64748b" }}>Loading patients...</p>
        )}

        {!loading && error && (
          <p style={{ color: "crimson", background: "#fee2e2", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5" }}>
            {error}
          </p>
        )}

        {/* Table */}
        {!loading && !error && (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Segoe UI, sans-serif" }}>
              <thead>
                <tr>
                  {["Id", "Name", "Gender", "Date of Birth", "Phone", "Email", "Notes", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(to right, #f8fafc, #f1f5f9)", color: "#2b5876", fontWeight: 700, fontSize: "14px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>{patient.id}</td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{patient.name}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>
                        <span style={{ padding: "4px 8px", borderRadius: "4px", background: "#f1f5f9", fontSize: "12px", fontWeight: 500, color: "#475569" }}>
                          {patient.gender}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>
                        {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "-"}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>{patient.phone}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>{patient.email}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#64748b", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {patient.notes || "-"}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", color: "#2b5876", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }}>
                            View
                          </button>
                          <button style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}