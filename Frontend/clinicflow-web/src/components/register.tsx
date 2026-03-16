import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi, PortalType } from "../api/auth";

const gradient = "linear-gradient(135deg, #2b5876, #4e4376)";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [portal, setPortal] = useState<PortalType>("User");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handlePortalSelect = (choice: PortalType) => {
    setPortal(choice);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Username, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (portal === "Admin" && !adminCode.trim()) {
      setError("Admin code is required for the admin portal.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerApi({
        username: username.trim(),
        email: email.trim(),
        password,
        portal,
        adminCode: portal === "Admin" ? adminCode.trim() : undefined,
      });
      navigate("/login", { state: { registeredUsername: username.trim() } });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.response?.data ?? "Registration failed";
      setError(typeof message === "string" ? message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>ClinicFlow</div>
          <div style={styles.subBrand}>Create your workspace access</div>
        </div>
      </div>

      <div style={styles.centerWrapper}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <div style={styles.logo}>ClinicFlow</div>
          <h2 style={styles.title}>Create an account</h2>
          <p style={styles.subtitle}>Pick the correct portal and set up your credentials.</p>

          <div style={styles.portalToggle}>
            {["User", "Admin"].map((choice) => {
              const active = portal === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handlePortalSelect(choice as PortalType)}
                  style={{
                    ...styles.portalButton,
                    background: active ? gradient : "#f8fafc",
                    color: active ? "white" : "#475569",
                    borderColor: active ? "transparent" : "#e2e8f0",
                    boxShadow: active ? "0 8px 20px rgba(75,85,99,0.3)" : "none",
                  }}
                >
                  {choice === "Admin" ? "Administrator" : "Care Team"}
                </button>
              );
            })}
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={styles.input}
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            style={styles.input}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={styles.input}
          />

          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            type="password"
            style={styles.input}
          />

          {portal === "Admin" && (
            <input
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Admin registration code"
              style={styles.input}
            />
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <div style={styles.footerLinks}>
            <span>Already have credentials?</span>
            <Link to="/login" style={styles.link}>
              Back to login
            </Link>
          </div>
        </form>
      </div>

      <div style={styles.footer}>© 2026 ClinicFlow • Secure Healthcare System</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f7f9fc",
  },
  header: {
    background: gradient,
    padding: "20px 0",
    color: "white",
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInner: {
    width: "90%",
    margin: "0 auto",
  },
  brand: {
    fontSize: 50,
    fontStyle: "italic",
    color: "white",
    fontWeight: 700,
    letterSpacing: 1,
  },
  subBrand: {
    fontSize: 24,
    color: "white",
    opacity: 0.8,
  },
  centerWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },
  card: {
    width: 640,
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    padding: "40px 32px",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  logo: {
    fontSize: 40,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 10,
    background: gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    color: "#1e293b",
    fontSize: 26,
    fontWeight: 600,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#64748b",
    fontSize: 15,
  },
  portalToggle: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  portalButton: {
    borderRadius: 10,
    border: "1px solid transparent",
    padding: "14px 18px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  input: {
    width: "100%",
    height: 44,
    padding: "12px 14px",
    marginBottom: 16,
    background: "#f3f5f9",
    borderRadius: 8,
    border: "1px solid #dcdcdc",
    fontSize: 14,
    outline: "none",
  },
  button: {
    width: "100%",
    height: 50,
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: gradient,
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  error: {
    background: "#ffe5e5",
    color: "#b00020",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },
  footerLinks: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    gap: 8,
    fontSize: 14,
    color: "#475569",
  },
  link: {
    color: "#2b5876",
    fontWeight: 600,
    textDecoration: "none",
  },
  footer: {
    background: gradient,
    color: "white",
    textAlign: "center",
    padding: 15,
    fontSize: 13,
  },
};
