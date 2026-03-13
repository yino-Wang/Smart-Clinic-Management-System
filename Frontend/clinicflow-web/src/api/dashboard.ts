import { api } from "./axios";

export interface DashboardMetrics {
  totalPatients: number;
  todayAppointments: number;
  activeDoctors: number;
  completedToday: number;
  pendingToday: number;
  cancelledToday: number;
}

export interface TodayUpcomingAppointment {
  id: number;
  patientName: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface WeeklyTrendItem {
  date: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  todayUpcoming: TodayUpcomingAppointment[];
  weeklyTrend: WeeklyTrendItem[];
}

export interface DoctorWorkload {
  doctorId: number;
  doctorName: string;
  totalAppointments: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface RecentPatient {
  id: number;
  name: string;
  gender: string;
  phone: string;
  email: string;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await api.get("/api/dashboard/overview");
  return res.data;
}

export async function getDoctorWorkload(): Promise<DoctorWorkload[]> {
  const res = await api.get("/api/dashboard/doctor-workload");
  return res.data;
}

export async function getRecentPatients(): Promise<RecentPatient[]> {
  const res = await api.get("/api/dashboard/recent-patients");
  return res.data;
}
