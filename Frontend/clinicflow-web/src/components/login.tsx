import { useState } from "react";
import { login } from "../api/auth";

export default function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function onSubmit() {
    setError("");
    try {
      const data = await login(username, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.role);
      onDone();
    } catch (e: any) {
      setError(e?.response?.data ?? "Login failed");
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
        <div style={styles.card}>
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

          <button onClick={onSubmit} style={styles.button}>
            Login
          </button>

          <div style={styles.demo}>
            Demo users: admin/admin123, user/user123
          </div>
        </div>
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

  demo: {
    marginTop: 20,
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
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