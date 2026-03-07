import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient, CreatePatientDto } from "../api/patients";
import Topbar from "../components/topbar";

export default function NewPatient() {
    const navigate = useNavigate();

    const [form, setForm] = useState<CreatePatientDto>({
        name: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        notes: "",
    });

    //loading and error states for form submission
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({
             ...prev, 
             [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.name.trim()) {
        setError("Patient name is required.");
        return;
        }

        if (!form.gender.trim()) {
        setError("Gender is required.");
        return;
        }

        if (!form.dateOfBirth) {
        setError("Date of birth is required.");
        return;
        }

        if (!form.phone.trim()) {
        setError("Phone is required.");
        return;
        }

        if (!form.email.trim()) {
        setError("Email is required.");
        return;
        }

        try {
        setLoading(true);
        setError("");

        await createPatient(form);

        navigate("/patients");
        } catch (err: any) {
        console.error("Failed to create patient:", err);
        setError("Failed to create patient.");
        } finally {
        setLoading(false);
        }

    }
      return (
    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "32px", overflowY: "auto" }}>
      <Topbar
        title="New Patient"
        description="Create a new patient record for the clinic system."
      />

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #fecaca",
          backgroundColor: "#fef2f2",
          padding: "16px",
          fontSize: "14px",
          color: "#dc2626"
        }}>
          {error}
        </div>
      )}

      {/* Form card */}
      <div style={{
          maxWidth: "800px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#fff",
          padding: "24px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          marginTop: "24px"
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Yino Wang"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "8px 16px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "8px 16px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "white"
                }}
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "8px 16px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 0412345678"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "8px 16px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. yino@example.com"
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "8px 16px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes ?? ""}
              onChange={handleChange}
              placeholder="Optional notes about the patient..."
              rows={4}
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "8px 16px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical"
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {loading ? "Saving..." : "Save Patient"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/patients")}
              style={{
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}


