import { useEffect, useState } from "react";
import {
  Appointment,
  CreateAppointmentDto,
  createAppointment,
  getAppointments,
} from "../src/api/appointments"
import { deleteAppointment, updateAppointment } from "../src/api/appointments";
import Login from "./components/login";


function toLocalInputValue(d: Date) {
  // datetime-local : "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>("");
  const [authed, setAuthed] = useState(!!localStorage.getItem("accessToken"));

  const [role, setRole] = useState(localStorage.getItem("role") || "user"); // default to "user" if not set
  const isAdmin = (role || "").toLowerCase() === "admin";

  // form state with default startTime = now + 10min, endTime = now + 40min
  const now = new Date();
  const [form, setForm] = useState<CreateAppointmentDto>({
    patientName: "",
    doctorName: "",
    startTime: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
    endTime: new Date(now.getTime() + 40 * 60 * 1000).toISOString(),
    status: "Scheduled",
  });

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await getAppointments();
      setItems(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(authed) refresh();
  }, [authed]);

  async function onSubmit() {
    setError("");

    if (!form.patientName.trim() || !form.doctorName.trim()) {
      setError("PatientName and DoctorName are required.");
      return;
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("EndTime must be later than StartTime.");
      return;
    }


    try {
      await createAppointment(form);
      // clear patientName and doctorName but keep the last selected times and status for faster entry
      setForm((prev) => ({
        ...prev,
        patientName: "",
        doctorName: "",
      }));
      await refresh();
    } catch (e: any) {
      console.error(e);
      // error message from backend validation or other issues
      const msg =
        e?.response?.data?.title ||
        e?.response?.data ||
        e?.message ||
        "Create failed";
      setError(String(msg));
    }
  }

  //token validation
  if (!authed) 
    return <Login onDone={() => {
      setAuthed(true);
      setRole(localStorage.getItem("role") || "user");
    }} />;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
      <h1 style={{ marginBottom: 8 }}>ClinicFlow</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        Please input your details to create a new appointment. 
      </p>

      <div
        style={{
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
          marginBottom: 20,
          maxWidth: 1000,
        }}
      >
        <h2 style={{ marginTop: 0 }}>New Appointment</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label>Patient Name</label>
            <input
              value={form.patientName}
              onChange={(e) =>
                setForm((p) => ({ ...p, patientName: e.target.value }))
              }
              style={{ width: "90%", padding: 10, marginTop: 6 }}
              placeholder="e.g., Yino"
            />
          </div>

          <div>
            <label>Doctor Name</label>
            <input
              value={form.doctorName}
              onChange={(e) =>
                setForm((p) => ({ ...p, doctorName: e.target.value }))
              }
              style={{ width: "90%", padding: 10, marginTop: 6 }}
              placeholder="e.g., Dr Lee"
            />
          </div>

          <div>
            <label>Start Time</label>
            <input
              type="datetime-local"
              value={toLocalInputValue(new Date(form.startTime))}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  startTime: new Date(e.target.value).toISOString(),
                }))
              }
              style={{ width: "90%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>End Time</label>
            <input
              type="datetime-local"
              value={toLocalInputValue(new Date(form.endTime))}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  endTime: new Date(e.target.value).toISOString(),
                }))
              }
              style={{ width: "90%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
            <button
              onClick={onSubmit}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                cursor: "pointer",
              }}
            >
              Add
            </button>

            <button
              onClick={refresh}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #aaa",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "crimson", marginTop: 12 }}>
            <b>Error:</b> {error}
          </p>
        )}
      </div>

      <h2>Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ opacity: 0.75 }}>No appointments yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr>
              {["Id", "Patient", "Doctor", "Start", "End", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom: "1px solid #ddd",
                    background: "#fafafa",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  {a.id}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  {a.patientName}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  {a.doctorName}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  {new Date(a.startTime).toLocaleString()}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  {new Date(a.endTime).toLocaleString()}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    <select
                      value={a.status}
                      onChange={async (e) => {
                        const next = e.target.value;
                        try {
                          await updateAppointment(a.id, next);
                          await refresh();
                        } catch (err) {
                          console.error(err);
                          setError("Failed to update status");
                        }
                      }}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete appointment #${a.id}?`)) return;
                        try {
                          await deleteAppointment(a.id);
                          await refresh();
                        } catch (err) {
                          console.error(err);
                          setError("Failed to delete appointment");
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #d33",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  )}
                  
                </td>
              </tr>
              
            ))}
          </tbody>
        </table>
      )}

      <button style={{ marginTop: 20, color: "black", backgroundColor:"lightgray"}} onClick={() => { localStorage.clear(); window.location.reload(); }}>
        Logout
      </button>

    </div>
  );
}
