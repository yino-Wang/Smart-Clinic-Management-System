import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/topbar";
import { useAuth } from "../context/authContext";
import { Appointment, getAppointments, updateAppointment, deleteAppointment } from "../api/appointments";

export default function Appointments() {
  const { role } = useAuth();
  const isAdmin = (role || "").trim().toLowerCase() === "admin";
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await getAppointments();
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <Topbar 
        title="All Appointments" 
        description="Manage clinic appointments and track their current status." 
        extra={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              onClick={refresh} 
              style={{ backgroundColor: "#f8fafc", color: "#4e4376", padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" }}
            >
              Refresh
            </button>
            <Link 
              to="/appointments/new" 
              style={{ background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px", display: "inline-block", boxShadow: "0 2px 4px rgba(43,88,118,0.2)", transition: "all 0.2s" }}
            >
              + New Appointment
            </Link>
          </div>
        }
      />
      
      <div style={{ padding: "32px", maxWidth: "1200px" }}>
        {error && <p style={{ color: "crimson", marginBottom: 16 }}>{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p style={{ opacity: 0.75 }}>No appointments yet.</p>
        ) : (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Segoe UI, sans-serif" }}>
              <thead>
                <tr>
                  {["Id", "Patient", "Doctor", "Start", "End", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(to right, #f8fafc, #f1f5f9)", color: "#2b5876", fontWeight: 700, fontSize: "14px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>{a.id}</td>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>{a.patientName}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#475569" }}>{a.doctorName}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>{new Date(a.startTime).toLocaleString()}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#64748b" }}>{new Date(a.endTime).toLocaleString()}</td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      <select
                        value={a.status}
                        onChange={async (e) => {
                          try { await updateAppointment(a.id, e.target.value); await refresh(); } catch(err) { setError("Failed to update status"); }
                        }}
                        style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", cursor: "pointer", background: "white", fontSize: "13px" }}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      {isAdmin ? (
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete appointment #${a.id}?`)) return;
                            try { await deleteAppointment(a.id); await refresh(); } catch(err) { setError("Failed to delete appointment"); }
                          }}
                          style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 500, fontSize: "13px" }}
                        >
                          Delete
                        </button>
                      ) : (
                        <span style={{ opacity: 0.6 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========== CALENDAR VIEW ========== */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", fontFamily: "Segoe UI, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#2b5876", fontWeight: 700 }}>
                Calendar
              </h2>
              <div style={{ fontSize: "14px", color: "#4e4376", marginTop: "4px", opacity: 0.8 }}>Shows appointments for the selected month</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                style={{ padding: "6px 12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#2b5876", transition: "all 0.2s" }}
              >
                ◀ Prev
              </button>
              
              <button 
                onClick={() => setCalendarDate(new Date())}
                style={{ padding: "6px 12px", background: "linear-gradient(135deg, #2b5876, #4e4376)", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(43,88,118,0.2)" }}
              >
                Today
              </button>

              <span style={{ fontSize: "16px", fontWeight: 700, color: "#2b5876", minWidth: "130px", textAlign: "center" }}>
                {calendarDate.toLocaleString('default', { month: 'long' })} {calendarDate.getFullYear()}
              </span>

              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                style={{ padding: "6px 12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#2b5876", transition: "all 0.2s" }}
              >
                Next ▶
              </button>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: "center", fontWeight: 700, color: "#4e4376", padding: "8px", fontSize: "14px" }}>{d}</div>
            ))}
            {
              Array.from({ length: 42 }).map((_, i) => {
                const realToday = new Date();
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const dayNum = i - firstDay + 1;
                const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
                const isToday = isValidDay && dayNum === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear();
                
                const dayAppts = isValidDay ? items.filter(a => {
                  const d = new Date(a.startTime);
                  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
                }) : [];

                return (
                  <div key={i} style={{ 
                    minHeight: "90px", 
                    border: isValidDay ? "1px solid #e2e8f0" : "1px dashed transparent", 
                    borderRadius: "8px", 
                    padding: "8px",
                    background: isValidDay ? (isToday ? "#f0f4f8" : "white") : "transparent",
                    transition: "all 0.2s"
                  }}>
                    {isValidDay && (
                      <div style={{ 
                        fontWeight: isToday ? 700 : 600, 
                        marginBottom: "4px", 
                        color: isToday ? "#2b5876" : "#4e4376", 
                        fontSize: "14px",
                        display: "inline-block",
                        width: "26px",
                        height: "26px",
                        lineHeight: "26px",
                        textAlign: "center",
                        borderRadius: "50%",
                        background: isToday ? "rgba(43,88,118,0.15)" : "transparent"
                      }}>
                        {dayNum}
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                      {dayAppts.map(appt => (
                        <div key={appt.id} style={{ 
                          fontSize: "11px", 
                          background: appt.status === "Completed" ? "#dcfce7" : appt.status === "Cancelled" ? "#fee2e2" : "#e0e7ff",
                          color: appt.status === "Completed" ? "#166534" : appt.status === "Cancelled" ? "#991b1b" : "#3730a3", 
                          padding: "2px 6px", 
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 500
                        }} title={`${appt.patientName} - ${new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}>
                          {new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {appt.patientName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

      </div>
    </div>
  );
}
