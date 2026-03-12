import axios from "axios";
import { api } from "./axios";

export async function getAppointments() {
  const res = await api.get("/api/Appointments");
  return res.data;
}

export async function createAppointment(dto: any) {
  const res = await api.post("/api/Appointments", dto);
  return res.data;
}

export async function updateAppointment(id: number, status: string) {
  const res = await api.patch(`/api/Appointments/${id}/status`, { status });
  return res.data;
}

export async function deleteAppointment(id: number) {
  await api.delete(`/api/Appointments/${id}`);
}

export interface Appointment {
  id: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface CreateAppointmentDto {
  patientName: string;
  doctorId: number | null;
  startTime: string;
  endTime: string;
  status: string;
}

export async function getDoctorBookedSlots(doctorId: number, date: string) {
  // date format expected: YYYY-MM-DD
  const res = await api.get(`/api/Appointments/doctor/${doctorId}/date/${date}`);
  return res.data; // array of { startTime, endTime }
}