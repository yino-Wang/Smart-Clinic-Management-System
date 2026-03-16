import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../context/authContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const navState = location.state as { registeredUsername?: string } | undefined;
    if (navState?.registeredUsername) {
      setSuccess(`Account ${navState.registeredUsername} created successfully. Please sign in.`);
      navigate("/login", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await loginApi(username.trim(), password);
      login(data.accessToken, data.role);
      navigate("/");
    } catch (e: any) {
      const message = e?.response?.data ?? "Login failed";
      setError(typeof message === "string" ? message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>

      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>ClinicFlow</div>
          <div style={styles.subBrand}>Healthcare Management Portal</div>
        </div>
      </div>

      {/* ===== CENTER LOGIN ===== */}
      <div style={styles.centerWrapper}>
        <form style={styles.card} onSubmit={onSubmit}>
          <div style={styles.logo}>ClinicFlow</div>
          <h2 style={styles.title}>Sign in to your account</h2>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={styles.input}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={styles.input}
          />

          {error && <div style={styles.error}>{String(error)}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          <div style={styles.demo}>
            Demo users: admin/admin123, user/user123
          </div>
          <div style={styles.footerLinks}>
            <span>Need an account?</span>
            <Link to="/register" style={styles.link}>
              Create one
            </Link>
          </div>
        </form>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={styles.footer}>
        © 2026 ClinicFlow • Secure Healthcare System
      </div>

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

  /* HEADER */
  header: {
    background: "linear-gradient(135deg, #2b5876, #4e4376)",
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
    fontStyle:"italic",
    color: "white",
    fontWeight: 700,
    letterSpacing: 1,
  },
  subBrand: {
    fontSize: 25,
    fontStyle:"normal",
    color: "white",
    fontWeight: 400,
    opacity: 0.8,
  },

  /* CENTER */
  centerWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 600,
    height: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
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
    background: "linear-gradient(135deg, #2b5876, #4e4376)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
    fontSize: 25,
    fontWeight: 600,
  },

  input: {
    width: "100%",
    height: 40,
    padding: "12px 14px",
    marginBottom: 20,
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
    background: "linear-gradient(135deg, #2b5876, #4e4376)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },

  error: {
    background: "#ffe5e5",
    color: "#b00020",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },

  success: {
    background: "#ecfdf5",
    color: "#047857",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },

  demo: {
    marginTop: 20,
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
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

  /* FOOTER */
  footer: {
    background: "linear-gradient(135deg, #2b5876, #4e4376)",
    color: "white",
    textAlign: "center",
    padding: 15,
    fontSize: 13,
  },
};