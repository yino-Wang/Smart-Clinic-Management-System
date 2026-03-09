import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatients, updatePatient, CreatePatientDto, getPatientById } from "../api/patients";
import Topbar from "../components/topbar";

export default function EditPatient(){
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState<CreatePatientDto>({
        name: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        notes: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    function formatDateForInput(dateStr: string) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({
             ...prev, 
             [name]: value }));
    }

    useEffect(() => {
        async function loadPatient() {
            try{
                setLoading(true);
                setError("");

                if(!id){
                    setError("Invalid patient ID.");
                    return;
                }

                const data = await getPatientById(Number(id));
                if(!data){
                    setError("Patient not found.");
                    return;
                }


                setForm({
                    name: data.name || "",
                    gender: data.gender || "",
                    dateOfBirth: formatDateForInput(data.dateOfBirth) || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    notes: data.notes || "",
                })
                
            }catch(err: any){
                console.error("Failed to load patient:", err);
                setError("Failed to load patient.");
            }finally{
                setLoading(false);
            }
        }
        
        loadPatient();
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if(!id){
            setError("Invalid patient ID.");
            return;
        }

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

        try{
            setSaving(true);
            setError("");

            await updatePatient(Number(id), form);

            navigate("/patients");
        }catch(err: any){
            console.error("Failed to update patient:", err);
            setError("Failed to update patient.");
        }finally{
            setSaving(false);
        }
    }

  if (loading) {
    return (
      <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "32px", overflowY: "auto" }}>
        <div style={{ borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#fff", padding: "24px", color: "#64748b" }}>
          Loading patient...
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "32px", overflowY: "auto" }}>
      <Topbar
        title="Edit Patient"
        description="Update patient information in the clinic system."
      />

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box", backgroundColor: "white" }}
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

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
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Notes</label>
            <textarea
              name="notes"
              value={form.notes ?? ""}
              onChange={handleChange}
              rows={4}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {saving ? "Updating..." : "Update Patient"}
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

