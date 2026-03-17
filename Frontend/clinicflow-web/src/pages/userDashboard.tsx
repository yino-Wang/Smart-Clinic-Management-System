import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/topbar";
import { getUserDashboardOverview, UserDashboardOverview } from "../api/dashboard";
import { USER_PORTAL_PREFIX } from "../routes/paths";

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  padding: "24px",
};

export default function UserDashboard() {
  const [overview, setOverview] = useState<UserDashboardOverview | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserDashboardOverview()
      .then((data) => setOverview(data))
      .catch((err) => {
        console.error("Failed to load user dashboard", err);
        setError(err?.response?.data ?? "Unable to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const ctaHref = overview?.cta?.href || `${USER_PORTAL_PREFIX}/my-appointments`;
  const ctaHeading = overview?.cta?.label ?? "Need a new appointment?";
  const ctaButtonLabel = overview?.cta?.label ?? "Book now";

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", paddingBottom: 40 }}>
      <Topbar
        title="Personal Dashboard"
        description="Quick glance at upcoming visits, your last check-in, and personalized tips."
      />

      <div style={{ padding: "32px" }}>
        {loading && <p style={{ color: "#64748b" }}>Loading...</p>}
        {!loading && error && (
          <div style={{ ...cardStyle, color: "#b91c1c", background: "#fef2f2" }}>{error}</div>
        )}

        {!loading && overview && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
              <div style={{ ...cardStyle, background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white" }}>
                <p style={{ margin: 0, opacity: 0.8 }}>Upcoming appointments</p>
                <h2 style={{ margin: "12px 0 0", fontSize: "36px" }}>{overview.upcomingAppointments}</h2>
              </div>
              <div style={cardStyle}>
                <p style={{ margin: 0, color: "#64748b" }}>Last visit</p>
                <h2 style={{ margin: "12px 0 0", color: "#0f172a", fontSize: "28px" }}>
                  {overview.lastVisit ? new Date(overview.lastVisit).toLocaleDateString() : "No record"}
                </h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ ...cardStyle, minHeight: "220px" }}>
                <h3 style={{ margin: 0, color: "#1e293b" }}>Next appointment</h3>
                {overview.nextAppointment ? (
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", color: "#475569" }}>
                    <span style={{ fontSize: "20px", fontWeight: 600 }}>{overview.nextAppointment.doctorName}</span>
                    <span style={{ fontSize: "16px" }}>
                      {new Date(overview.nextAppointment.startTime).toLocaleString()}
                    </span>
                    {overview.nextAppointment.note && (
                      <span style={{ fontSize: "14px" }}>{overview.nextAppointment.note}</span>
                    )}
                  </div>
                ) : (
                  <p style={{ marginTop: "16px", color: "#94a3b8" }}>No appointment yet—book now to stay on track.</p>
                )}
                <button
                  onClick={() => navigate(`${USER_PORTAL_PREFIX}/my-appointments`)}
                  style={{
                    marginTop: "24px",
                    alignSelf: "flex-start",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #2b5876, #4e4376)",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  See appointments
                </button>
              </div>

              <div style={{ ...cardStyle, minHeight: "220px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ margin: 0, color: "#1e293b" }}>Clinic tips</h3>
                {overview.tips?.length ? (
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "#475569", lineHeight: 1.6 }}>
                    {overview.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: "#94a3b8" }}>No tips yet</p>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 8px", color: "#1e293b" }}>{ctaHeading}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>Send a request anytime and we'll confirm shortly.</p>
              </div>
              <button
                onClick={() => navigate(ctaHref)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #2b5876, #4e4376)",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                >
                  {ctaButtonLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
