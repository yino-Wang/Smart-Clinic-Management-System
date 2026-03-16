import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/topbar";
import { getClinicPreferences, updateClinicPreferences, ClinicPreferences } from "../api/settings";
import { changePassword } from "../api/auth";
import { useAuth } from "../context/authContext";

type Status = { type: "success" | "error"; message: string } | null;

const gradient = "linear-gradient(135deg, #2b5876, #4e4376)";

export default function Settings() {
  const { role, username, logout } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<ClinicPreferences>({
    clinicName: "",
    businessHours: "",
    defaultTimeSlotMinutes: 30,
    enableNotifications: true,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefStatus, setPrefStatus] = useState<Status>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await getClinicPreferences();
        setPreferences(data);
      } catch (err) {
        setPrefStatus({ type: "error", message: formatError(err) });
      } finally {
        setLoadingPrefs(false);
      }
    };
    loadPreferences();
  }, []);

  const formatError = (err: any) => {
    const message = err?.response?.data?.message ?? err?.response?.data ?? err?.message;
    return typeof message === "string" ? message : "Something went wrong";
  };

  const handlePreferenceChange = (field: keyof ClinicPreferences, value: string | number | boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== "Admin") {
      setPrefStatus({ type: "error", message: "Only administrators can update clinic preferences." });
      return;
    }

    setSavingPrefs(true);
    setPrefStatus(null);
    try {
      const updated = await updateClinicPreferences(preferences);
      setPreferences(updated);
      setPrefStatus({ type: "success", message: "Preferences saved successfully." });
    } catch (err) {
      setPrefStatus({ type: "error", message: formatError(err) });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordStatus({ type: "error", message: "Both current and new passwords are required." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStatus({ type: "success", message: "Password updated successfully." });
    } catch (err) {
      setPasswordStatus({ type: "error", message: formatError(err) });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSwitchAccount = () => {
    logout();
    navigate("/login");
  };

  const initials = (username ?? "CF").slice(0, 2).toUpperCase();
  const isAdmin = role === "Admin";

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", paddingBottom: "40px" }}>
      <Topbar title="Settings" description="Manage your account profile and global clinic preferences." />

      <div
        style={{
          padding: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Account Profile */}
        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px 0", color: "#2b5876", fontSize: "20px" }}>Account Profile</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Change your password or jump to another account.</p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: gradient,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {initials}
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "18px" }}>{username ?? "Current user"}</h3>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "2px 8px",
                  backgroundColor: isAdmin ? "#e0e7ff" : "#d1fae5",
                  color: isAdmin ? "#4338ca" : "#047857",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "12px",
                  textTransform: "capitalize",
                }}
              >
                {role ?? "User"}
              </span>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={passwordFieldStyle}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={passwordFieldStyle}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={passwordFieldStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {passwordStatus && (
              <div style={passwordStatus.type === "success" ? successBanner : errorBanner}>{passwordStatus.message}</div>
            )}

            <button
              type="submit"
              style={{
                padding: "12px",
                background: "white",
                border: `1px solid ${changingPassword ? "#94a3b8" : "#2b5876"}`,
                color: "#2b5876",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: changingPassword ? "not-allowed" : "pointer",
                opacity: changingPassword ? 0.7 : 1,
              }}
              disabled={changingPassword}
            >
              {changingPassword ? "Updating password..." : "Change Password"}
            </button>
          </form>

          <button
            onClick={handleSwitchAccount}
            style={{
              padding: "12px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#475569",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Switch Account
          </button>
        </div>

        {/* Clinic Preferences */}
        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 8px 0", color: "#2b5876", fontSize: "20px" }}>Clinic Preferences</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              {isAdmin ? "Set up the default operational rules for the clinic." : "You can review preferences. Only admins can make updates."}
            </p>
          </div>

          {loadingPrefs ? (
            <div style={{ color: "#475569" }}>Loading preferences...</div>
          ) : (
            <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Clinic Name</label>
                <input
                  type="text"
                  value={preferences.clinicName}
                  onChange={(e) => handlePreferenceChange("clinicName", e.target.value)}
                  style={inputStyle}
                  disabled={!isAdmin}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Business Hours</label>
                  <input
                    type="text"
                    value={preferences.businessHours}
                    onChange={(e) => handlePreferenceChange("businessHours", e.target.value)}
                    style={inputStyle}
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Default Time Slot</label>
                  <select
                    value={preferences.defaultTimeSlotMinutes}
                    onChange={(e) => handlePreferenceChange("defaultTimeSlotMinutes", Number(e.target.value))}
                    style={inputStyle}
                    disabled={!isAdmin}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <input
                  type="checkbox"
                  checked={preferences.enableNotifications}
                  onChange={(e) => handlePreferenceChange("enableNotifications", e.target.checked)}
                  id="notifications"
                  style={{ width: "18px", height: "18px", cursor: !isAdmin ? "not-allowed" : "pointer" }}
                  disabled={!isAdmin}
                />
                <label htmlFor="notifications" style={{ color: "#334155", fontSize: "14px" }}>
                  Enable browser notifications for new appointments
                </label>
              </div>

              {prefStatus && (
                <div style={prefStatus.type === "success" ? successBanner : errorBanner}>{prefStatus.message}</div>
              )}

              {isAdmin && (
                <button
                  type="submit"
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: gradient,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: savingPrefs ? "not-allowed" : "pointer",
                    opacity: savingPrefs ? 0.7 : 1,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                  disabled={savingPrefs}
                >
                  {savingPrefs ? "Saving preferences..." : "Save Preferences"}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#4e4376",
  fontWeight: 600,
  fontSize: "14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
  outline: "none",
  color: "#334155",
};

const passwordFieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const successBanner: React.CSSProperties = {
  background: "#ecfdf5",
  color: "#047857",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 13,
};

const errorBanner: React.CSSProperties = {
  background: "#ffe5e5",
  color: "#b00020",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 13,
};