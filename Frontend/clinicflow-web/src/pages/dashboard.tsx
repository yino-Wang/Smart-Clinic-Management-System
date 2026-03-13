import { useEffect, useState } from "react";
import Topbar from "../components/topbar";
import { 
  DashboardOverview, 
  DoctorWorkload, 
  RecentPatient, 
  getDashboardOverview, 
  getDoctorWorkload, 
  getRecentPatients 
} from "../api/dashboard";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [workload, setWorkload] = useState<DoctorWorkload[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewData, workloadData, patientsData] = await Promise.all([
          getDashboardOverview(),
          getDoctorWorkload(),
          getRecentPatients()
        ]);
        setOverview(overviewData);
        setWorkload(workloadData);
        setRecentPatients(patientsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !overview) {
    return (
      <div>
        <Topbar title="Dashboard" description="Overview of your clinic." />
        <div style={{ padding: "32px", color: "#64748b" }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  const { metrics, todayUpcoming, weeklyTrend } = overview;

  return (
    <div style={{ paddingBottom: "40px" }}>
      <Topbar title="Dashboard" description="Overview of your clinic today." />

      <div style={{ padding: "32px" }}>
        
        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          
          <div style={{ background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500, opacity: 0.9 }}>Total Patients</h3>
            <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: 700 }}>{metrics.totalPatients}</p>
          </div>
          
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500, color: "#64748b" }}>Today's Appts</h3>
            <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: 700, color: "#0f172a" }}>{metrics.todayAppointments}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
              <span><span style={{ color: "#10b981", fontWeight: "bold" }}>●</span> {metrics.completedToday} Done</span>
              <span><span style={{ color: "#ef4444", fontWeight: "bold" }}>●</span> {metrics.cancelledToday} Cancelled</span>
            </div>
          </div>
          
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500, color: "#64748b" }}>Pending Today</h3>
            <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: 700, color: "#f59e0b" }}>{metrics.pendingToday}</p>
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500, color: "#64748b" }}>Active Doctors</h3>
            <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: 700, color: "#3b82f6" }}>{metrics.activeDoctors}</p>
          </div>
        </div>

        {/* Charts & Lists */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          
          {/* Main Chart Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#334155", fontSize: "18px" }}>Weekly Appointment Trend</h3>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#2b5876" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: "18px" }}>Doctor Workload (Today)</h3>
              {workload.length === 0 ? (
                <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No doctors scheduled for today.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "14px" }}>
                      <th style={{ padding: "12px 8px" }}>Doctor</th>
                      <th style={{ padding: "12px 8px", textAlign: "center" }}>Pending</th>
                      <th style={{ padding: "12px 8px", textAlign: "center" }}>Completed</th>
                      <th style={{ padding: "12px 8px", textAlign: "center" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workload.map((w) => (
                      <tr key={w.doctorId} style={{ borderBottom: "1px solid #e2e8f0", fontSize: "14px", color: "#334155" }}>
                        <td style={{ padding: "12px 8px", fontWeight: 500 }}>{w.doctorName}</td>
                        <td style={{ padding: "12px 8px", textAlign: "center", color: "#f59e0b" }}>{w.pending}</td>
                        <td style={{ padding: "12px 8px", textAlign: "center", color: "#10b981" }}>{w.completed}</td>
                        <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600 }}>{w.totalAppointments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: "18px" }}>Upcoming Today</h3>
              {todayUpcoming.length === 0 ? (
                <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No upcoming appointments today!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {todayUpcoming.map((app) => (
                    <div key={app.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid #4e4376" }}>
                      <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>{app.patientName}</p>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                        <span>with {app.doctorName}</span>
                        <span>{new Date(app.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: "18px" }}>Recently Added Patients</h3>
              {recentPatients.length === 0 ? (
                <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No patients found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentPatients.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#475569" }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, color: "#1e293b", fontSize: "14px" }}>{p.name}</p>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{p.phone || p.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
