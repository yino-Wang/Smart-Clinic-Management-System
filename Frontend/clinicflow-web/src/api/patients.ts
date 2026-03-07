import { api } from "./axios";

export interface Patient {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  notes?: string | null;
}

export interface CreatePatientDto{
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  notes?: string | null;
}

export async function getPatients(): Promise<Patient[]> {
  const res = await api.get("/api/Patients");
  return Array.isArray(res.data) ? res.data : [];
}

export async function getPatientById(id: number): Promise<Patient> {
  const res = await api.get(`/api/Patients/${id}`);
  return res.data;
}

export async function createPatient(data: Omit<Patient, "id">) {
  const res = await api.post("/api/Patients", data);
  return res.data;
}

export async function updatePatient(id: number, data: Omit<Patient, "id">) {
  const res = await api.put(`/api/Patients/${id}`, data);
  return res.data;
}

export async function deletePatient(id: number) {
  await api.delete(`/api/Patients/${id}`);
}