import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Topbar from "../components/topbar";
import {
  Appointment,
  CreateAppointmentDto,
  createAppointment,
  getDoctorBookedSlots,
  getMyAppointments,
} from "../api/appointments";
import { Doctor, getDoctors } from "../api/doctor";

interface AppointmentFormState {
  patientName: string;
  doctorId: number | null;
  date: string;
  time: string;
  durationMinutes: number;
}

const gradient = "linear-gradient(135deg, #2b5876, #4e4376)";

const initialDate = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const initialTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 5));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);

  const [form, setForm] = useState<AppointmentFormState>({
    patientName: "",
    doctorId: null,
    date: initialDate(),
    time: initialTime(),
    durationMinutes: 30,
  });

  useEffect(() => {
    refresh();
    getDoctors().then(setDoctors).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (form.doctorId && form.date) {
      getDoctorBookedSlots(form.doctorId, form.date)
        .then(setBookedSlots)
        .catch(() => setBookedSlots([]));
    } else {
      setBookedSlots([]);
    }
  }, [form.doctorId, form.date]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load appointments", err);
      setError(err?.response?.data ?? "Unable to fetch appointment records.");
    } finally {
      setLoading(false);
    }
  };

  const toNaiveDateTime = (date: string, time: string) => {
    return `${date}T${time}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.patientName.trim() || !form.doctorId) {
      setError("Please enter your name and choose a doctor.");
      return;
    }

    const startTime = new Date(toNaiveDateTime(form.date, form.time));
    const endTime = new Date(startTime.getTime() + form.durationMinutes * 60000);

    const pad = (n: number) => String(n).padStart(2, "0");
    const toPayload = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    const payload: CreateAppointmentDto = {
      patientName: form.patientName.trim(),
      doctorId: form.doctorId,
      startTime: toPayload(startTime),
      endTime: toPayload(endTime),
      status: "Scheduled",
    };

    try {
  await createAppointment(payload);
  setSuccess("Appointment request submitted. We'll confirm with you soon.");
      setShowForm(false);
      setForm({
        patientName: "",
        doctorId: null,
        date: initialDate(),
        time: initialTime(),
        durationMinutes: 30,
      });
      await refresh();
    } catch (err: any) {
      console.error("Failed to create appointment", err);
  const msg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? "Submission failed.";
      setError(msg);
    }
  };

  const groupedAppointments = useMemo(() => {
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const now = new Date();

    appointments.forEach((appt) => {
      const start = new Date(appt.startTime);
      if (start >= now) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });

    return { upcoming, past };
  }, [appointments]);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <Topbar
        title="My Appointments"
        description="Review and manage every appointment tied to your profile."
        extra={
          <button
            onClick={() => setShowForm((prev) => !prev)}
            style={{
              background: gradient,
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showForm ? "Hide form" : "Book a visit"}
          </button>
        }
      />

      <div style={{ padding: "32px" }}>
        {error && (
          <div style={{ marginBottom: "16px", background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: "16px", background: "#ecfdf5", color: "#047857", padding: "12px", borderRadius: "8px" }}>
            {success}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              padding: "24px",
              marginBottom: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Full name</label>
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))}
                placeholder="Enter your full name"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Choose a doctor</label>
              <select
                value={form.doctorId ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value ? Number(e.target.value) : null }))}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Start time</label>
                <input
                  type="time"
                  step={300}
                  value={form.time}
                  onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Duration</label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {[15, 30, 45, 60].map((m) => (
                    <option key={m} value={m}>
                      {m} mins
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.doctorId && form.date && (
              <div style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
                <p style={{ margin: 0, fontWeight: 600, color: "#475569" }}>
                  Booked slots on {form.date}:
                </p>
                {bookedSlots.length === 0 ? (
                  <p style={{ marginTop: 8, color: "#10b981" }}>No conflicts for this date—you can pick any time.</p>
                ) : (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: 8 }}>
                    {bookedSlots.map((slot, idx) => (
                      <span key={idx} style={{ background: "#fee2e2", color: "#b91c1c", padding: "4px 8px", borderRadius: "6px", fontSize: "13px" }}>
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: "12px 20px", borderRadius: "8px", border: "none", background: gradient, color: "white", fontWeight: 600 }}
              >
                Submit request
              </button>
            </div>
          </form>
        )}

        <section style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 16px", color: "#1e293b" }}>Upcoming appointments</h3>
          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading...</p>
          ) : groupedAppointments.upcoming.length === 0 ? (
            <div style={{ ...cardStyle }}>No appointments yet</div>
          ) : (
            <AppointmentTable items={groupedAppointments.upcoming} />
          )}
        </section>

        <section>
          <h3 style={{ margin: "0 0 16px", color: "#1e293b" }}>Appointment history</h3>
          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading...</p>
          ) : groupedAppointments.past.length === 0 ? (
            <div style={{ ...cardStyle }}>No history yet</div>
          ) : (
            <AppointmentTable items={groupedAppointments.past} muted />
          )}
        </section>
      </div>
    </div>
  );
}

function AppointmentTable({ items, muted }: { items: Appointment[]; muted?: boolean }) {
  return (
    <div style={{ ...cardStyle, borderColor: muted ? "#f1f5f9" : "#e2e8f0" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#475569", fontSize: "14px" }}>
              <th style={{ padding: "12px 8px" }}>Doctor</th>
              <th style={{ padding: "12px 8px" }}>Time</th>
              <th style={{ padding: "12px 8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid #e2e8f0", color: muted ? "#94a3b8" : "#1e293b" }}>
                <td style={{ padding: "12px 8px", fontWeight: 600 }}>{item.doctorName}</td>
                <td style={{ padding: "12px 8px" }}>
                  {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={{ padding: "12px 8px", textTransform: "capitalize" }}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  padding: "24px",
};
