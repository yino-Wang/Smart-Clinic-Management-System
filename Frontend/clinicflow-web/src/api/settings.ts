import { api } from "./axios";

export interface ClinicPreferences {
  clinicName: string;
  businessHours: string;
  defaultTimeSlotMinutes: number;
  enableNotifications: boolean;
}

export async function getClinicPreferences() {
  const res = await api.get<ClinicPreferences>("/api/Settings/clinic-preferences");
  return res.data;
}

export async function updateClinicPreferences(payload: ClinicPreferences) {
  const res = await api.put<ClinicPreferences>("/api/Settings/clinic-preferences", payload);
  return res.data;
}
