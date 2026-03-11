import { api } from "./axios";

export interface Doctor {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  specialty: string;
  photoUrl?: string;
  availability?: string;
  notes?: string;
}

export interface CreateDoctorDto {
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  specialty: string;
  photoUrl?: string;
  availability?: string;
  notes?: string;
}

export async function getDoctors(): Promise<Doctor[]> {
    const res = await api.get("/api/Doctor");
    return Array.isArray(res.data) ? res.data : [];
}

export async function getDoctorById(id: number): Promise<Doctor> {
    const res = await api.get(`/api/Doctor/${id}`);
    return res.data;
}

export async function createDoctor(data: Omit<Doctor, "id">) {
    const res = await api.post("/api/Doctor", data);
    return res.data;
}

export async function updateDoctor(id: number, data: Omit<Doctor, "id">) {
    const res = await api.put(`/api/Doctor/${id}`, data);
    return res.data;
}

export async function deleteDoctor(id: number) {
    await api.delete(`/api/Doctor/${id}`);
}

