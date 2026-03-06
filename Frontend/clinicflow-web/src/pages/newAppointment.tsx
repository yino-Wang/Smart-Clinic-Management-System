import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/topbar";
import { CreateAppointmentDto, createAppointment } from "../api/appointments"; 

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewAppointment() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateAppointmentDto>(() => {
    const now = new Date();
    return {
      patientName: "", doctorName: "",
      startTime: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 40 * 60 * 1000).toISOString(),
      status: "Scheduled",
    };
  });

  async function onSubmit() {
    setError("");
    if (!form.patientName.trim() || !form.doctorName.trim()) { setError("PatientName and DoctorName are required."); return; }
    if (new Date(form.endTime) <= new Date(form.startTime)) { setError("EndTime must be later than StartTime."); return; }

    setLoading(true);
    try {
      await createAppointment(form);
      navigate("/appointments");
    } catch (e: any) {
      const msg = e?.response?.data?.title || e?.response?.data || e?.message || "Create failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <Topbar 
        title="New Appointment" 
        description="Create a new appointment for a patient." 
      />
      <div style={{ padding: "32px", maxWidth: "800px" }}>
        <div style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>Patient Name</label>
              <input value={form.patientName} onChange={(e) => setForm(p => ({...p, patientName: e.target.value}))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none", fontSize: "14px" }} placeholder="e.g., Yino" />
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>Doctor Name</label>
              <input value={form.doctorName} onChange={(e) => setForm(p => ({...p, doctorName: e.target.value}))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none", fontSize: "14px" }} placeholder="e.g., Dr Lee" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>Start Time</label>
              <input type="datetime-local" value={toLocalInputValue(new Date(form.startTime))} onChange={(e) => setForm(p => ({...p, startTime: new Date(e.target.value).toISOString()}))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none", fontSize: "14px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>End Time</label>
              <input type="datetime-local" value={toLocalInputValue(new Date(form.endTime))} onChange={(e) => setForm(p => ({...p, endTime: new Date(e.target.value).toISOString()}))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none", fontSize: "14px" }} />
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm(p => ({...p, status: e.target.value}))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none", fontSize: "14px", cursor: "pointer" }}>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px", marginTop: "16px" }}>
              <button onClick={onSubmit} disabled={loading} style={{ background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", boxShadow: "0 4px 6px rgba(43,88,118,0.2)" }}>
                {loading ? "Saving..." : "Create Appointment"}
              </button>
              <button onClick={() => navigate("/appointments")} style={{ background: "#f8fafc", color: "#4e4376", padding: "12px 24px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
            </div>
          </div>
          {error && <p style={{ color: "crimson", marginTop: "24px", background: "#fee2e2", padding: "12px", borderRadius: "8px", fontSize: "14px" }}><b>Error:</b> {error}</p>}
        </div>
      </div>
    </div>
  );
}