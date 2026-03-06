import Topbar from "../components/topbar";

export default function Patients() {
  return (
    <div>
      <Topbar 
        title="Patients" 
        description="Manage patient records and medical histories." 
      />
      <div style={{ padding: "32px", color: "#64748b" }}>
        <h2>Patients Content Coming Soon...</h2>
      </div>
    </div>
  );
}