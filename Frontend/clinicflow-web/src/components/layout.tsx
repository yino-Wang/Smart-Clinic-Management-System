import { useState } from "react";
import Sidebar from "./sidebar";
import { useAuth } from "../context/authContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { username } = useAuth();
  const initials = (username ?? "CF").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw", margin: 0 }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex: 1, backgroundColor: "#f7f9fc", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Global Action Header */}
        <header style={{ height: 60, backgroundColor: "white", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, color: "#64748b" }}>
              ☰
            </button>
            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "16px" }}>ClinicFlow</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <input type="text" placeholder="Search..." style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", width: "200px" }} />
            <div style={{ cursor: "pointer", fontSize: 18 }}>🔔</div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#2b5876", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 12 }}>
              {initials}
            </div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}