import { useState } from "react";
import { login } from "../api/auth";
//import { useNavigate } from "react-router-dom";

export default function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  //  const navigate = useNavigate();
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
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 24, border: "1px solid #ddd", borderRadius: 12 }}>
      <h2>Login</h2>

      <input value={username} 
            onChange={(e) => setUsername(e.target.value)}
             placeholder="username"
             style={{ width: "100%", padding: 10, marginTop: 10 }} />
      <input value={password} 
            onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password"
             style={{ width: "100%", padding: 10, marginTop: 10 }} />
      
      <button onClick={onSubmit} style={{ marginTop: 12, padding: "10px 14px" }}>Sign in</button>
      {error && <p style={{ color: "crimson" }}>{String(error)}</p>}
      
      <p style={{ opacity: 0.7, marginTop: 12 }}>
        demo users: admin/admin123, user/user123
      </p>
    </div>
  );
}
