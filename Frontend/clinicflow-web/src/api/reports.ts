import { api } from "./axios";

export type SortDirection = "asc" | "desc";
export type ReportFormat = "csv" | "pdf";

export interface ReportFilterEcho {
  rangeStart: string;
  rangeEnd: string;
  doctorId?: number;
  status?: string;
  timeOfDay?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
  specialty?: string;
  workloadThreshold?: number;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface AppointmentReportRow {
  appointmentId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: string;
  durationMinutes: number;
  timeOfDay: string;
}

export interface ReportKeyMetrics {
  totalAppointments: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  patientGrowthPercentage: number;
  doctorUtilization: number;
  averageVisitDurationMinutes: number;
}

export interface AppointmentReportResponse {
  filters: ReportFilterEcho;
  keyMetrics: ReportKeyMetrics;
  trend: Array<{ date: string; scheduled: number; completed: number; cancelled: number; total: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  doctorWorkload: Array<{ doctorId: number; doctorName: string; scheduled: number; completed: number; cancelled: number; total: number }>;
  table: PagedResult<AppointmentReportRow>;
}

export interface PatientReportRow {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  phone: string;
  email: string;
  registeredAt: string;
  isActive: boolean;
  lastAppointmentAt?: string | null;
}

export interface PatientReportSummary {
  totalPatients: number;
  activePatients: number;
  activeRate: number;
  growthRate: number;
  averageAge: number;
}

export interface PatientActivityComparison {
  registeredTotal: number;
  activeTotal: number;
}

export interface PatientReportResponse {
  filters: ReportFilterEcho;
  summary: PatientReportSummary;
  activityComparison: PatientActivityComparison;
  registrationTrend: Array<{ date: string; registered: number }>;
  table: PagedResult<PatientReportRow>;
}

export interface AppointmentReportQueryParams {
  startDate?: string;
  endDate?: string;
  doctorId?: number;
  status?: string;
  timeOfDay?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

export interface AppointmentReportExportRequest extends AppointmentReportQueryParams {
  format: ReportFormat;
}

export interface PatientReportQueryParams {
  registeredFrom?: string;
  registeredTo?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

export interface PatientReportExportRequest extends PatientReportQueryParams {
  format: ReportFormat;
}

function pruneParams<T extends Record<string, any>>(params: T): Record<string, any> {
  return Object.entries(params).reduce<Record<string, any>>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    if (typeof value === "string" && value.trim() === "") {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

export async function getAppointmentReport(params: AppointmentReportQueryParams): Promise<AppointmentReportResponse> {
  const res = await api.get("/api/reports/appointments", { params: pruneParams(params) });
  return res.data;
}

export async function exportAppointmentReport(params: AppointmentReportExportRequest): Promise<Blob> {
  const res = await api.post("/api/reports/appointments/export", pruneParams(params), { responseType: "blob" });
  return res.data;
}

export async function getPatientReport(params: PatientReportQueryParams): Promise<PatientReportResponse> {
  const res = await api.get("/api/reports/patients", { params: pruneParams(params) });
  return res.data;
}

export async function exportPatientReport(params: PatientReportExportRequest): Promise<Blob> {
  const res = await api.post("/api/reports/patients/export", pruneParams(params), { responseType: "blob" });
  return res.data;
}
