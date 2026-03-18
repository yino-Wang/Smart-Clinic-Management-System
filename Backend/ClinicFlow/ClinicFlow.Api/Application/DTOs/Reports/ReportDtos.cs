using System;
using System.Collections.Generic;

namespace ClinicFlow.Api.Application.DTOs.Reports
{
    public class AppointmentReportResponseDto
    {
        public ReportFilterEchoDto Filters { get; set; } = new();
        public ReportKeyMetricsDto KeyMetrics { get; set; } = new();
        public IReadOnlyList<StatusTrendPointDto> Trend { get; set; } = Array.Empty<StatusTrendPointDto>();
        public IReadOnlyList<StatusDistributionSliceDto> StatusDistribution { get; set; } = Array.Empty<StatusDistributionSliceDto>();
        public IReadOnlyList<DoctorWorkloadBarDto> DoctorWorkload { get; set; } = Array.Empty<DoctorWorkloadBarDto>();
        public PagedResultDto<AppointmentReportRowDto> Table { get; set; } = new();
    }

    public class PatientReportResponseDto
    {
        public ReportFilterEchoDto Filters { get; set; } = new();
        public PatientReportSummaryDto Summary { get; set; } = new();
        public PatientActivityComparisonDto ActivityComparison { get; set; } = new();
        public IReadOnlyList<DailyRegistrationTrendPoint> RegistrationTrend { get; set; } = Array.Empty<DailyRegistrationTrendPoint>();
        public PagedResultDto<PatientReportRowDto> Table { get; set; } = new();
    }

    public class DoctorReportResponseDto
    {
        public ReportFilterEchoDto Filters { get; set; } = new();
        public DoctorReportSummaryDto Summary { get; set; } = new();
        public IReadOnlyList<DoctorWorkloadBarDto> Workload { get; set; } = Array.Empty<DoctorWorkloadBarDto>();
        public PagedResultDto<DoctorReportRowDto> Table { get; set; } = new();
    }

    public class ReportFilterEchoDto
    {
        public DateTime RangeStart { get; set; }
        public DateTime RangeEnd { get; set; }
        public int? DoctorId { get; set; }
        public string? Status { get; set; }
        public string? TimeOfDay { get; set; }
        public string? Gender { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public bool? IsActive { get; set; }
        public string? Specialty { get; set; }
        public int? WorkloadThreshold { get; set; }
    }

    public class ReportKeyMetricsDto
    {
        public int TotalAppointments { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal CancellationRate { get; set; }
        public decimal NoShowRate { get; set; }
        public decimal PatientGrowthPercentage { get; set; }
        public decimal DoctorUtilization { get; set; }
        public double AverageVisitDurationMinutes { get; set; }
    }

    public class StatusTrendPointDto
    {
        public string Date { get; set; } = string.Empty;
        public int Scheduled { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public int Total { get; set; }
    }

    public class StatusDistributionSliceDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class DoctorWorkloadBarDto
    {
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public int Scheduled { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public int Total { get; set; }
    }

    public class AppointmentReportRowDto
    {
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string TimeOfDay { get; set; } = string.Empty;
    }

    public class PatientReportSummaryDto
    {
        public int TotalPatients { get; set; }
        public int ActivePatients { get; set; }
        public decimal ActiveRate { get; set; }
        public decimal GrowthRate { get; set; }
        public double AverageAge { get; set; }
    }

    public class PatientActivityComparisonDto
    {
        public int RegisteredTotal { get; set; }
        public int ActiveTotal { get; set; }
    }

    public class DailyRegistrationTrendPoint
    {
        public string Date { get; set; } = string.Empty;
        public int Registered { get; set; }
    }

    public class PatientReportRowDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public int Age { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastAppointmentAt { get; set; }
    }

    public class DoctorReportSummaryDto
    {
        public int TotalDoctors { get; set; }
        public int ActiveDoctors { get; set; }
        public double AverageAppointmentsPerDoctor { get; set; }
        public double AverageCompletionRate { get; set; }
        public double AverageUtilizationRate { get; set; }
    }

    public class DoctorReportRowDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int ScheduledAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public double UtilizationRate { get; set; }
        public string WorkloadLevel { get; set; } = string.Empty;
    }

    public class PagedResultDto<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalItems / (double)PageSize);
        public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
    }
}
