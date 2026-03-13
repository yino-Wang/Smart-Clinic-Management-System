import { useState } from "react";
import Topbar from "../components/topbar";

export default function Settings() {
  // Mock clinic settings state (Frontend only for now)
  const [clinicName, setClinicName] = useState("ClinicFlow Main Branch");
  const [businessHours, setBusinessHours] = useState("09:00 AM - 05:00 PM");
  const [timeSlot, setTimeSlot] = useState("30");
  const [notifications, setNotifications] = useState(true);

  // Mock save action
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Preferences saved successfully! (Saved to frontend for now)");
  };

  // Mock unimplemented features
  const handleNotImplemented = (action: string) => {
    alert(`${action} is under development and will be connected to the backend soon!`);
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", paddingBottom: "40px" }}>
      <Topbar 
        title="Settings" 
        description="Manage your account profile and global clinic preferences." 
      />

      <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Account Profile Card */}
        <div style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0", color: "#2b5876", fontSize: "20px" }}>Account Profile</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>View and manage your personal credentials.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>
              A
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "18px" }}>Admin User</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>admin@clinicflow.com</p>
              <span style={{ display: "inline-block", marginTop: "8px", padding: "2px 8px", backgroundColor: "#e0e7ff", color: "#4338ca", fontSize: "12px", fontWeight: 600, borderRadius: "12px" }}>Administrator</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
            <button 
              onClick={() => handleNotImplemented("Change Password")}
              style={{ flex: 1, padding: "10px", backgroundColor: "white", border: "1px solid #2b5876", color: "#2b5876", borderRadius: "8px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              Change Password
            </button>
            <button 
              onClick={() => handleNotImplemented("Switch Account")}
              style={{ flex: 1, padding: "10px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "8px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              Switch Account
            </button>
          </div>
        </div>

        {/* Global Preferences Card */}
        <div style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 8px 0", color: "#2b5876", fontSize: "20px" }}>Clinic Preferences</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Set up the default operational rules for the clinic.</p>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#4e4376", fontWeight: 600, fontSize: "14px" }}>Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", boxSizing: "border-box", outline: "none", color: "#334155" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#4e4376", fontWeight: 600, fontSize: "14px" }}>Business Hours</label>
                <input
                  type="text"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", boxSizing: "border-box", outline: "none", color: "#334155" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#4e4376", fontWeight: 600, fontSize: "14px" }}>Default Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", boxSizing: "border-box", outline: "none", color: "#334155" }}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)} 
                id="noti-checkbox"
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="noti-checkbox" style={{ color: "#334155", fontSize: "14px", cursor: "pointer", userSelect: "none" }}>
                Enable browser notifications for new appointments
              </label>
            </div>

            <button 
              type="submit"
              style={{ marginTop: "12px", padding: "12px", background: "linear-gradient(135deg, #2b5876, #4e4376)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            >
              Save Preferences
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}