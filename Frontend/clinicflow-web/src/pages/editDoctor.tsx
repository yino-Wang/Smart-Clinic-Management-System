import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorById, updateDoctor, CreateDoctorDto } from "../api/doctor";
import Topbar from "../components/topbar";

export default function EditDoctor() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState<CreateDoctorDto>({
        name: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        specialty: "",
        photoUrl: "",
        availability: "",
        notes: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    function formatDateForInput(dateStr: string) {
        if (!dateStr) return "";
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
            [name]: value
        }));
    }

    useEffect(() => {
        async function loadDoctor() {
            try {
                setLoading(true);
                setError("");

                if (!id) {
                    setError("Invalid doctor ID.");
                    return;
                }

                const data = await getDoctorById(Number(id));
                if (!data) {
                    setError("Doctor not found.");
                    return;
                }

                setForm({
                    name: data.name || "",
                    gender: data.gender || "",
                    dateOfBirth: formatDateForInput(data.dateOfBirth) || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    specialty: data.specialty || "",
                    photoUrl: data.photoUrl || "",
                    availability: data.availability || "",
                    notes: data.notes || "",
                });

            } catch (err: any) {
                console.error("Failed to load doctor:", err);
                setError("Failed to load doctor.");
            } finally {
                setLoading(false);
            }
        }

        loadDoctor();
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!id) {
            setError("Invalid doctor ID.");
            return;
        }

        if (!form.name.trim()) {
            setError("Doctor name is required.");
            return;
        }

        if (!form.specialty.trim()) {
            setError("Specialty is required.");
            return;
        }

        if (!form.phone.trim()) {
            setError("Phone is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            await updateDoctor(Number(id), form);
            navigate("/doctors");
        } catch (err: any) {
            console.error("Failed to update doctor:", err);
            setError("Failed to update doctor.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "32px", overflowY: "auto" }}>
                <div style={{ borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#fff", padding: "24px", color: "#64748b" }}>
                    Loading doctor...
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "32px", overflowY: "auto", fontFamily: "Segoe UI, sans-serif" }}>
            <Topbar
                title="Edit Doctor"
                description="Update doctor information in the clinic system."
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
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Specialty</label>
                            <input
                                type="text"
                                name="specialty"
                                value={form.specialty}
                                onChange={handleChange}
                                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
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
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Profile Photo URL</label>
                            <input
                                type="text"
                                name="photoUrl"
                                value={form.photoUrl ?? ""}
                                onChange={handleChange}
                                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Availability</label>
                            <input
                                type="text"
                                name="availability"
                                value={form.availability ?? ""}
                                onChange={handleChange}
                                style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
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
                            {saving ? "Updating..." : "Update Doctor"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/doctors")}
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
