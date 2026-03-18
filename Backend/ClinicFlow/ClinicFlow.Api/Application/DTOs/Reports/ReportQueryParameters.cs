using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicFlow.Api.Application.DTOs.Reports
{
    public class AppointmentReportQueryParameters
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? DoctorId { get; set; }
        public string? Status { get; set; }
        public string? TimeOfDay { get; set; }

        [Range(1, 500)]
        public int Page { get; set; } = 1;

        [Range(1, 200)]
        public int PageSize { get; set; } = 25;

        public string SortBy { get; set; } = "startTime";
        public string SortDirection { get; set; } = "desc";
    }

    public class AppointmentReportExportRequest : AppointmentReportQueryParameters
    {
        public string Format { get; set; } = "csv";
    }

    public class PatientReportQueryParameters
    {
        public DateTime? RegisteredFrom { get; set; }
        public DateTime? RegisteredTo { get; set; }
        public string? Gender { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public bool? IsActive { get; set; }

        [Range(1, 500)]
        public int Page { get; set; } = 1;

        [Range(1, 200)]
        public int PageSize { get; set; } = 25;

        public string SortBy { get; set; } = "registeredAt";
        public string SortDirection { get; set; } = "desc";
    }

    public class PatientReportExportRequest : PatientReportQueryParameters
    {
        public string Format { get; set; } = "csv";
    }

    public class DoctorReportQueryParameters
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Specialty { get; set; }
        public bool? IsActive { get; set; }
        public int? WorkloadThreshold { get; set; }

        [Range(1, 500)]
        public int Page { get; set; } = 1;

        [Range(1, 200)]
        public int PageSize { get; set; } = 25;

        public string SortBy { get; set; } = "name";
        public string SortDirection { get; set; } = "asc";
    }

    public class DoctorReportExportRequest : DoctorReportQueryParameters
    {
        public string Format { get; set; } = "csv";
    }
}
