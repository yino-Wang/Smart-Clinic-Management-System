import { useEffect, useMemo, useState } from "react";
import Topbar from "../components/topbar";
import { getDoctors, type Doctor } from "../api/doctor";
import {
  getAppointmentReport,
  getPatientReport,
  exportAppointmentReport,
  exportPatientReport,
  type AppointmentReportResponse,
  type PatientReportResponse,
  type SortDirection,
  type ReportFormat,
} from "../api/reports";

type ReportTab = "appointments" | "patients";

const gradient = "linear-gradient(135deg, #2b5876, #4e4376)";
const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
  padding: 24,
};

const appointmentStatuses = ["Scheduled", "Completed", "Cancelled", "NoShow"];
const timeOfDayOptions = [
  { label: "Any", value: "" },
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Evening", value: "evening" },
  { label: "Night", value: "night" },
];
const genderOptions = [
  { label: "Any", value: "" },
  { label: "Female", value: "Female" },
  { label: "Male", value: "Male" },
  { label: "Other", value: "Other" },
];

interface AppointmentFilterState {
  startDate: string;
  endDate: string;
  doctorId: string;
  status: string;
  timeOfDay: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

interface PatientFilterState {
  registeredFrom: string;
  registeredTo: string;
  gender: string;
  minAge: string;
  maxAge: string;
  isActive: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

const defaultAppointmentFilters = (): AppointmentFilterState => ({
  startDate: formatDateInput(addDays(new Date(), -14)),
  endDate: formatDateInput(new Date()),
  doctorId: "",
  status: "",
  timeOfDay: "",
  page: 1,
  pageSize: 25,
  sortBy: "startTime",
  sortDirection: "desc",
});

const defaultPatientFilters = (): PatientFilterState => ({
  registeredFrom: formatDateInput(addDays(new Date(), -30)),
  registeredTo: formatDateInput(new Date()),
  gender: "",
  minAge: "",
  maxAge: "",
  isActive: "",
  page: 1,
  pageSize: 25,
  sortBy: "registeredAt",
  sortDirection: "desc",
});

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("appointments");
  const [appointmentFilters, setAppointmentFilters] = useState<AppointmentFilterState>(() => defaultAppointmentFilters());
  const [patientFilters, setPatientFilters] = useState<PatientFilterState>(() => defaultPatientFilters());

  const [appointmentReport, setAppointmentReport] = useState<AppointmentReportResponse | null>(null);
  const [patientReport, setPatientReport] = useState<PatientReportResponse | null>(null);

  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [patientsError, setPatientsError] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorError, setDoctorError] = useState("");

  const [exporting, setExporting] = useState<{ tab: ReportTab; format: ReportFormat } | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(() => setDoctorError("Unable to load doctors list."));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAppointmentsLoading(true);
    setAppointmentsError("");

    const params = mapAppointmentFilters(appointmentFilters);

    getAppointmentReport(params)
      .then((data) => {
        if (!cancelled) {
          setAppointmentReport(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAppointmentsError(resolveErrorMessage(err) ?? "Unable to load appointment report.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAppointmentsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentFilters]);

  useEffect(() => {
    let cancelled = false;
    setPatientsLoading(true);
    setPatientsError("");

    const params = mapPatientFilters(patientFilters);

    getPatientReport(params)
      .then((data) => {
        if (!cancelled) {
          setPatientReport(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPatientsError(resolveErrorMessage(err) ?? "Unable to load patient report.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPatientsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [patientFilters]);

  const appointmentCards = useMemo(() => buildAppointmentSummaryCards(appointmentReport), [appointmentReport]);
  const patientCards = useMemo(() => buildPatientSummaryCards(patientReport), [patientReport]);

  const handleAppointmentExport = async (format: ReportFormat) => {
    setExporting({ tab: "appointments", format });
    setExportMessage("");
    setExportError("");

    try {
      const blob = await exportAppointmentReport({ ...mapAppointmentFilters(appointmentFilters), format });
      const filename = generateFilename("appointments", format);
      triggerDownload(blob, filename);
      setExportMessage(`Appointments report (${format.toUpperCase()}) downloaded.`);
    } catch (err) {
      setExportError(resolveErrorMessage(err) ?? "Unable to export appointments report.");
    } finally {
      setExporting(null);
    }
  };

  const handlePatientExport = async (format: ReportFormat) => {
    setExporting({ tab: "patients", format });
    setExportMessage("");
    setExportError("");

    try {
      const blob = await exportPatientReport({ ...mapPatientFilters(patientFilters), format });
      const filename = generateFilename("patients", format);
      triggerDownload(blob, filename);
      setExportMessage(`Patients report (${format.toUpperCase()}) downloaded.`);
    } catch (err) {
      setExportError(resolveErrorMessage(err) ?? "Unable to export patients report.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <Topbar title="Reports" description="Filter, analyze, and export appointment or patient insights." />

      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { key: "appointments" as ReportTab, label: "Appointments Report" },
            { key: "patients" as ReportTab, label: "Patients Report" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid #d0d7ea",
                background: activeTab === tab.key ? gradient : "white",
                color: activeTab === tab.key ? "white" : "#2b5876",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: activeTab === tab.key ? "0 6px 18px rgba(43, 88, 118, 0.35)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "appointments" ? (
          <ReportSection
            type="appointments"
            filters={appointmentFilters}
            setFilters={(patch, options) =>
              setAppointmentFilters((prev) => applyFilterPatch(patch, options, prev))
            }
            cards={appointmentCards}
            report={appointmentReport}
            loading={appointmentsLoading}
            error={appointmentsError.trim()}
            doctorError={doctorError}
            doctors={doctors}
            onExport={handleAppointmentExport}
            exporting={exporting?.tab === "appointments" ? exporting : null}
            exportMessage={exportMessage}
            exportError={exportError}
            resetFilters={() => setAppointmentFilters(defaultAppointmentFilters())}
          />
        ) : (
          <ReportSection
            type="patients"
            filters={patientFilters}
            setFilters={(patch, options) =>
              setPatientFilters((prev) => applyFilterPatch(patch, options, prev))
            }
            cards={patientCards}
            report={patientReport}
            loading={patientsLoading}
            error={patientsError.trim()}
            doctorError={doctorError}
            doctors={doctors}
            onExport={handlePatientExport}
            exporting={exporting?.tab === "patients" ? exporting : null}
            exportMessage={exportMessage}
            exportError={exportError}
            resetFilters={() => setPatientFilters(defaultPatientFilters())}
          />
        )}
      </div>
    </div>
  );
}

interface ReportSectionProps {
  type: ReportTab;
  filters: AppointmentFilterState | PatientFilterState;
  setFilters: (
    patch: Partial<AppointmentFilterState & PatientFilterState>,
    options?: { resetPage?: boolean }
  ) => void;
  cards: SummaryCardData[];
  report: AppointmentReportResponse | PatientReportResponse | null;
  loading: boolean;
  error: string;
  doctorError: string;
  doctors: Doctor[];
  onExport: (format: ReportFormat) => Promise<void>;
  exporting: { tab: ReportTab; format: ReportFormat } | null;
  exportMessage: string;
  exportError: string;
  resetFilters: () => void;
}

function ReportSection(props: ReportSectionProps) {
  const {
    type,
    filters,
    setFilters,
    cards,
    report,
    loading,
    error,
    doctorError,
    doctors,
    onExport,
    exporting,
    exportMessage,
    exportError,
    resetFilters,
  } = props;

  const table = report?.table;
  const totalPages = table ? table.totalPages : 0;
  const page = table ? table.page : (filters as AppointmentFilterState).page;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...cardStyle }}>
        {type === "appointments" ? (
          <AppointmentFilters
            filters={filters as AppointmentFilterState}
            setFilters={setFilters}
            doctors={doctors}
            doctorError={doctorError}
            reset={resetFilters}
          />
        ) : (
          <PatientFilters
            filters={filters as PatientFilterState}
            setFilters={setFilters}
            reset={resetFilters}
          />
        )}
      </div>

      <SummaryCards cards={cards} />

      <div style={{ ...cardStyle }}>
        <ExportActions
          onExport={onExport}
          exporting={exporting}
          message={exportMessage}
          error={exportError}
        />
      </div>

      <div style={{ ...cardStyle }}>
        {loading && <p style={{ color: "#475569" }}>Loading report...</p>}
        {!loading && error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 12, borderRadius: 8 }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            {type === "appointments" ? (
              <AppointmentTable data={report as AppointmentReportResponse | null} />
            ) : (
              <PatientTable data={report as PatientReportResponse | null} />
            )}

            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={table?.totalItems ?? 0}
              onPrev={() => table && setFilters({ page: Math.max(1, table.page - 1) }, { resetPage: false })}
              onNext={() => table && setFilters({ page: Math.min(table.totalPages, table.page + 1) }, { resetPage: false })}
              disabledPrev={!table || table.page <= 1}
              disabledNext={!table || table.page >= table.totalPages}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface AppointmentFiltersProps {
  filters: AppointmentFilterState;
  setFilters: (
    patch: Partial<AppointmentFilterState>,
    options?: { resetPage?: boolean }
  ) => void;
  doctors: Doctor[];
  doctorError: string;
  reset: () => void;
}

function AppointmentFilters({ filters, setFilters, doctors, doctorError, reset }: AppointmentFiltersProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={filterGridStyle}>
        <FilterField label="Start date">
          <input
            type="date"
            value={filters.startDate}
            max={filters.endDate}
            onChange={(e) => setFilters({ startDate: e.target.value })}
            style={controlStyle}
          />
        </FilterField>
        <FilterField label="End date">
          <input
            type="date"
            value={filters.endDate}
            min={filters.startDate}
            onChange={(e) => setFilters({ endDate: e.target.value })}
            style={controlStyle}
          />
        </FilterField>
        <FilterField label="Doctor">
          <select value={filters.doctorId} onChange={(e) => setFilters({ doctorId: e.target.value })} style={controlStyle}>
            <option value="">All doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          {doctorError && <span style={hintStyle}>{doctorError}</span>}
        </FilterField>
        <FilterField label="Status">
          <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} style={controlStyle}>
            <option value="">All statuses</option>
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Time of day">
          <select value={filters.timeOfDay} onChange={(e) => setFilters({ timeOfDay: e.target.value })} style={controlStyle}>
            {timeOfDayOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Sort by">
          <select value={filters.sortBy} onChange={(e) => setFilters({ sortBy: e.target.value })} style={controlStyle}>
            <option value="startTime">Start time</option>
            <option value="status">Status</option>
            <option value="durationMinutes">Duration</option>
            <option value="doctorName">Doctor</option>
          </select>
        </FilterField>
        <FilterField label="Direction">
          <select value={filters.sortDirection} onChange={(e) => setFilters({ sortDirection: e.target.value as SortDirection })} style={controlStyle}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </FilterField>
        <FilterField label="Page size">
          <select
            value={filters.pageSize}
            onChange={(e) => setFilters({ pageSize: Number(e.target.value), page: 1 }, { resetPage: false })}
            style={controlStyle}
          >
            {[25, 50, 100, 150].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={reset} style={ghostButtonStyle}>
          Reset filters
        </button>
      </div>
    </div>
  );
}

interface PatientFiltersProps {
  filters: PatientFilterState;
  setFilters: (
    patch: Partial<PatientFilterState>,
    options?: { resetPage?: boolean }
  ) => void;
  reset: () => void;
}

function PatientFilters({ filters, setFilters, reset }: PatientFiltersProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={filterGridStyle}>
        <FilterField label="Registered from">
          <input
            type="date"
            value={filters.registeredFrom}
            max={filters.registeredTo}
            onChange={(e) => setFilters({ registeredFrom: e.target.value })}
            style={controlStyle}
          />
        </FilterField>
        <FilterField label="Registered to">
          <input
            type="date"
            value={filters.registeredTo}
            min={filters.registeredFrom}
            onChange={(e) => setFilters({ registeredTo: e.target.value })}
            style={controlStyle}
          />
        </FilterField>
        <FilterField label="Gender">
          <select value={filters.gender} onChange={(e) => setFilters({ gender: e.target.value })} style={controlStyle}>
            {genderOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Min age">
          <input
            type="number"
            min={0}
            value={filters.minAge}
            onChange={(e) => setFilters({ minAge: e.target.value })}
            style={controlStyle}
          />
        </FilterField>
        <FilterField label="Max age">
          <input
            type="number"
            min={0}
            value={filters.maxAge}
            onChange={(e) => setFilters({ maxAge: e.target.value })}
            style={controlStyle}
          />
        </FilterField>
        <FilterField label="Active status">
          <select value={filters.isActive} onChange={(e) => setFilters({ isActive: e.target.value })} style={controlStyle}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </FilterField>
        <FilterField label="Sort by">
          <select value={filters.sortBy} onChange={(e) => setFilters({ sortBy: e.target.value })} style={controlStyle}>
            <option value="registeredAt">Registered at</option>
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="isActive">Active status</option>
          </select>
        </FilterField>
        <FilterField label="Direction">
          <select value={filters.sortDirection} onChange={(e) => setFilters({ sortDirection: e.target.value as SortDirection })} style={controlStyle}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </FilterField>
        <FilterField label="Page size">
          <select
            value={filters.pageSize}
            onChange={(e) => setFilters({ pageSize: Number(e.target.value), page: 1 }, { resetPage: false })}
            style={controlStyle}
          >
            {[25, 50, 100, 150].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={reset} style={ghostButtonStyle}>
          Reset filters
        </button>
      </div>
    </div>
  );
}

interface ExportActionsProps {
  onExport: (format: ReportFormat) => Promise<void>;
  exporting: { tab: ReportTab; format: ReportFormat } | null;
  message: string;
  error: string;
}

function ExportActions({ onExport, exporting, message, error }: ExportActionsProps) {
  const isCsv = exporting?.format === "csv";
  const isPdf = exporting?.format === "pdf";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button
          style={{ ...primaryButtonStyle, minWidth: 140 }}
          onClick={() => onExport("csv")}
          disabled={!!exporting}
        >
          {isCsv ? "Generating..." : "Export CSV"}
        </button>
        <button
          style={{ ...secondaryButtonStyle, minWidth: 140 }}
          onClick={() => onExport("pdf")}
          disabled={!!exporting}
        >
          {isPdf ? "Generating..." : "Export PDF"}
        </button>
      </div>
      {message && <span style={{ color: "#047857", fontSize: 13 }}>{message}</span>}
      {error && <span style={{ color: "#b91c1c", fontSize: 13 }}>{error}</span>}
    </div>
  );
}

interface AppointmentTableProps {
  data: AppointmentReportResponse | null;
}

function AppointmentTable({ data }: AppointmentTableProps) {
  const rows = data?.table.items ?? [];

  if (rows.length === 0) {
    return <div style={{ color: "#94a3b8" }}>No records found for current filters.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Duration (min)</th>
            <th>Time of day</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.appointmentId}>
              <td>{row.appointmentId}</td>
              <td>{row.patientName}</td>
              <td>{row.doctorName || "-"}</td>
              <td>{formatDateTime(row.startTime)}</td>
              <td>{formatDateTime(row.endTime)}</td>
              <td>{row.status}</td>
              <td>{row.durationMinutes}</td>
              <td>{row.timeOfDay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PatientTableProps {
  data: PatientReportResponse | null;
}

function PatientTable({ data }: PatientTableProps) {
  const rows = data?.table.items ?? [];

  if (rows.length === 0) {
    return <div style={{ color: "#94a3b8" }}>No records found for current filters.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Registered</th>
            <th>Active</th>
            <th>Last visit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.gender || "-"}</td>
              <td>{row.age}</td>
              <td>{row.phone || "-"}</td>
              <td>{row.email || "-"}</td>
              <td>{formatDateTime(row.registeredAt)}</td>
              <td>{row.isActive ? "Yes" : "No"}</td>
              <td>{row.lastAppointmentAt ? formatDateTime(row.lastAppointmentAt) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SummaryCardData {
  id: string;
  label: string;
  value: string;
  hint?: string;
  accent?: "primary" | "neutral";
}

function SummaryCards({ cards }: { cards: SummaryCardData[] }) {
  if (!cards.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          style={{
            ...cardStyle,
            background: card.accent === "primary" ? gradient : cardStyle.background,
            color: card.accent === "primary" ? "white" : "#0f172a",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, opacity: card.accent === "primary" ? 0.85 : 0.7 }}>{card.label}</p>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{card.value}</div>
          {card.hint && (
            <span style={{ fontSize: 13, opacity: card.accent === "primary" ? 0.9 : 0.6 }}>{card.hint}</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  disabledPrev: boolean;
  disabledNext: boolean;
}

function PaginationControls({ page, totalPages, totalItems, onPrev, onNext, disabledPrev, disabledNext }: PaginationControlsProps) {
  if (!totalPages) {
    return null;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
      <span style={{ color: "#475569", fontSize: 14 }}>
        Page {page} of {totalPages} · {totalItems} total records
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={ghostButtonStyle} onClick={onPrev} disabled={disabledPrev}>
          Prev
        </button>
        <button style={ghostButtonStyle} onClick={onNext} disabled={disabledNext}>
          Next
        </button>
      </div>
    </div>
  );
}

function buildAppointmentSummaryCards(data: AppointmentReportResponse | null): SummaryCardData[] {
  if (!data) {
    return [];
  }

  const rangeText = `${formatDateOnly(data.filters.rangeStart)} → ${formatDateOnly(data.filters.rangeEnd)}`;
  const metrics = data.keyMetrics;

  return [
    {
      id: "total",
      label: "Total appointments",
      value: formatNumber(metrics.totalAppointments),
      hint: rangeText,
      accent: "primary",
    },
    {
      id: "completed",
      label: "Completion rate",
      value: formatPercent(metrics.completionRate),
      hint: "Completed vs total",
    },
    {
      id: "cancelled",
      label: "Cancellation rate",
      value: formatPercent(metrics.cancellationRate),
      hint: "Cancelled vs total",
    },
    {
      id: "duration",
      label: "Avg visit duration",
      value: `${Math.round(metrics.averageVisitDurationMinutes)} min`,
      hint: "Across filtered range",
    },
  ];
}

function buildPatientSummaryCards(data: PatientReportResponse | null): SummaryCardData[] {
  if (!data) {
    return [];
  }

  const rangeText = `${formatDateOnly(data.filters.rangeStart)} → ${formatDateOnly(data.filters.rangeEnd)}`;
  const summary = data.summary;
  const activity = data.activityComparison;

  return [
    {
      id: "total-patients",
      label: "Total patients",
      value: formatNumber(summary.totalPatients),
      hint: rangeText,
      accent: "primary",
    },
    {
      id: "growth",
      label: "Growth rate",
      value: formatPercent(summary.growthRate),
      hint: "New registrations vs prior period",
    },
    {
      id: "active-rate",
      label: "Active rate",
      value: formatPercent(summary.activeRate),
      hint: `${formatNumber(summary.activePatients)} active patients`,
    },
    {
      id: "new-registrations",
      label: "New registrations",
      value: formatNumber(activity.registeredTotal),
      hint: "During selected range",
    },
  ];
}

function mapAppointmentFilters(filters: AppointmentFilterState) {
  return {
    startDate: filters.startDate ? `${filters.startDate}T00:00:00Z` : undefined,
    endDate: filters.endDate ? `${filters.endDate}T23:59:59Z` : undefined,
    doctorId: filters.doctorId ? Number(filters.doctorId) : undefined,
    status: filters.status || undefined,
    timeOfDay: filters.timeOfDay || undefined,
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  };
}

function mapPatientFilters(filters: PatientFilterState) {
  return {
    registeredFrom: filters.registeredFrom ? `${filters.registeredFrom}T00:00:00Z` : undefined,
    registeredTo: filters.registeredTo ? `${filters.registeredTo}T23:59:59Z` : undefined,
    gender: filters.gender || undefined,
    minAge: filters.minAge ? Number(filters.minAge) : undefined,
    maxAge: filters.maxAge ? Number(filters.maxAge) : undefined,
    isActive:
      filters.isActive === ""
        ? undefined
        : filters.isActive === "true"
          ? true
          : false,
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  };
}

function applyFilterPatch<T extends AppointmentFilterState | PatientFilterState>(
  patch: Partial<T>,
  options: { resetPage?: boolean } = {},
  current: T
): T {
  const next = { ...current, ...patch };
  if (options.resetPage !== false && patch.page === undefined) {
    next.page = 1;
  }
  return next;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function generateFilename(prefix: string, format: ReportFormat) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-report-${timestamp}.${format}`;
}

function resolveErrorMessage(error: any): string | undefined {
  if (!error) return undefined;
  if (error.response?.data) {
    if (typeof error.response.data === "string") return error.response.data;
    if (typeof error.response.data?.message === "string") return error.response.data.message;
  }
  return error.message;
}

const filterGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const hintStyle: React.CSSProperties = {
  display: "block",
  marginTop: 4,
  fontSize: 12,
  color: "#ef4444",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: gradient,
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  background: "white",
  color: "#2b5876",
  border: "1px solid #cbd5f5",
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #dbeafe",
  background: "white",
  color: "#1e40af",
  fontWeight: 500,
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const controlStyle: React.CSSProperties = {
  width: "80%",
  padding: "10px 15px",
  marginTop: 6,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  color: "#0f172a",
  background: "white",
};

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#1e293b" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDateOnly(value: string | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatPercent(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "0%";
  }
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat().format(value ?? 0);
}