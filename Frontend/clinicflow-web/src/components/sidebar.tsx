import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/authContext";
import { ADMIN_PORTAL_PREFIX, USER_PORTAL_PREFIX } from "../routes/paths";

type NavItem = {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string }[];
};

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const { logout, role } = useAuth();
  const location = useLocation();

  const [openAppointments, setOpenAppointments] = useState(true);

  const isAdmin = (role || "").toLowerCase() === "admin";

  const navItems: NavItem[] = useMemo(() => {
    if (isAdmin) {
      return [
        {
          label: "Dashboard",
          path: `${ADMIN_PORTAL_PREFIX}/dashboard`,
          icon: <span className="text-lg">🏠</span>,
        },
        {
          label: "Appointments",
          icon: <span className="text-lg">📅</span>,
          children: [
            { label: "All Appointments", path: `${ADMIN_PORTAL_PREFIX}/appointments` },
            { label: "New Appointment", path: `${ADMIN_PORTAL_PREFIX}/appointments/new` },
          ],
        },
        {
          label: "Patients",
          path: `${ADMIN_PORTAL_PREFIX}/patients`,
          icon: <span className="text-lg">👥</span>,
        },
        {
          label: "Doctors",
          path: `${ADMIN_PORTAL_PREFIX}/doctors`,
          icon: <span className="text-lg">🧑‍⚕️</span>,
        },
        {
          label: "Reports",
          path: `${ADMIN_PORTAL_PREFIX}/reports`,
          icon: <span className="text-lg">📊</span>,
        },
        {
          label: "Clinic Settings",
          path: `${ADMIN_PORTAL_PREFIX}/settings`,
          icon: <span className="text-lg">⚙️</span>,
        },
      ];
    }

    return [
      {
        label: "Dashboard",
        path: `${USER_PORTAL_PREFIX}/dashboard`,
        icon: <span className="text-lg">🏠</span>,
      },
      {
        label: "Doctors",
        path: `${USER_PORTAL_PREFIX}/doctors`,
        icon: <span className="text-lg">🧑‍⚕️</span>,
      },
      {
        label: "My Appointments",
        path: `${USER_PORTAL_PREFIX}/my-appointments`,
        icon: <span className="text-lg">📅</span>,
      },
      {
        label: "Settings",
        path: `${USER_PORTAL_PREFIX}/settings`,
        icon: <span className="text-lg">⚙️</span>,
      },
    ];
  }, [isAdmin]);

  // Determine if the current route belongs to the appointments section (auto highlight/expand)
  const isInAppointments = isAdmin && location.pathname.startsWith(`${ADMIN_PORTAL_PREFIX}/appointments`);

  return (
    <aside
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "linear-gradient(135deg, #2b5876, #4e4376)",
        color: "white",
        borderRight: "1px solid #1a3c54",
        display: "flex",
        flexDirection: "column",
        width: collapsed ? 80 : 250,
        transition: "width 0.2s",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Brand */}
      <div 
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div 
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            CF
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: 18 }}>ClinicFlow</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Clinic Management</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: 4,
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <span style={{ fontSize: 18 }}>{collapsed ? "➡️" : "⬅️"}</span>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {navItems.map((item) => {
          if (item.children?.length) {
            const opened = openAppointments || isInAppointments;

            return (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={() => setOpenAppointments((v) => !v)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: isInAppointments ? "rgba(0,0,0,0.2)" : "transparent",
                    color: "inherit",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                    {!collapsed && (
                      <span style={{ fontWeight: 500 }}>{item.label}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      {opened ? "▼" : "▶"}
                    </span>
                  )}
                </button>

                {opened && !collapsed && (
                  <div style={{ paddingLeft: 48, display: "flex", flexDirection: "column", gap: 4 }}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        style={({ isActive }) => ({
                          display: "block",
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 14,
                          textDecoration: "none",
                          color: isActive ? "white" : "rgba(255,255,255,0.7)",
                          background: isActive ? "rgba(0,0,0,0.15)" : "transparent",
                        })}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Regular item
          return (
            <NavLink
              key={item.label}
              to={item.path!}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
                background: isActive ? "rgba(0,0,0,0.2)" : "transparent",
              })}
            >
              <div style={{ width: 24, display: "flex", justifyContent: "center" }}>{item.icon}</div>
              {!collapsed && <span style={{ fontWeight: 500 }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={() => logout()}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "rgba(255,0,0,0.1)",
            color: "#ffcccc",
            cursor: "pointer",
          }}
        >
          <div style={{ width: 24, display: "flex", justifyContent: "center" }}>🚪</div>
          {!collapsed && <span style={{ fontWeight: 500 }}>Logout</span>}
        </button>

        {!collapsed && (
          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
            © {new Date().getFullYear()} ClinicFlow
          </div>
        )}
      </div>
    </aside>
  );
}