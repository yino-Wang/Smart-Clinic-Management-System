import Topbar from "../components/topbar";

export default function Dashboard() {
  return (
    <div>
      <Topbar 
        title="Dashboard" 
        description="Overview of your clinic." 
      />
      <div style={{ padding: "32px", color: "#64748b" }}>
        <h2>Dashboard Content Coming Soon...</h2>
      </div>
    </div>
  );
}
