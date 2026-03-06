export default function Topbar({ title, description, extra }: { title: string, description: string, extra?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "26px", color: "#2b5876", fontWeight: 700 }}>{title}</h1>
        <p style={{ margin: "4px 0 0 0", color: "#4e4376", fontSize: "14px", opacity: 0.85 }}>{description}</p>
      </div>
      <div>
        {extra}
      </div>
    </div>
  );
}
