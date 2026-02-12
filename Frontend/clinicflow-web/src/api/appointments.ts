import axios from "axios";

export type Appointment = {
  id: number;
  patientName: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: string;
};

export type CreateAppointmentDto = {
  patientName: string;
  doctorName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: string;
};

export async function getAppointments() {
  const res = await axios.get<Appointment[]>("/api/appointments");
  return res.data;
}

export async function createAppointment(dto: CreateAppointmentDto) {
  const res = await axios.post("/api/appointments", dto);
  return res.data;
}

export async function updateAppointment(id: number, status: string) {
  const res = await axios.patch(`/api/appointments/${id}/status`, { status });
  return res.data;
}

export async function deleteAppointment(id: number) {
  await axios.delete(`/api/appointments/${id}`);
}