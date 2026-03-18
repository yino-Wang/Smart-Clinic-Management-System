using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClinicFlow.Api.Application.DTOs.Reports;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Domain.Entities;
using ClinicFlow.Api.Domain.Entities.Patient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ClinicFlow.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private const int DefaultAppointmentRangeDays = 14;
        private const int DefaultPatientRangeDays = 60;
        private const int DefaultDoctorRangeDays = 30;
        private const int DefaultDoctorWorkloadThreshold = 10;

        private readonly AppDbContext _db;

        static ReportsController()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public ReportsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("appointments")]
        public async Task<ActionResult<AppointmentReportResponseDto>> GetAppointmentReport([FromQuery] AppointmentReportQueryParameters? query)
        {
            query ??= new AppointmentReportQueryParameters();
            NormalizeAppointmentQuery(query);

            var (filteredQuery, range) = BuildAppointmentReportQuery(query);
            var response = await BuildAppointmentReportResponseAsync(filteredQuery, range, query);

            return Ok(response);
        }

        [HttpPost("appointments/export")]
        public async Task<IActionResult> ExportAppointments([FromBody] AppointmentReportExportRequest request)
        {
            request ??= new AppointmentReportExportRequest();
            NormalizeAppointmentQuery(request);

            var (filteredQuery, range) = BuildAppointmentReportQuery(request);

            var rows = await filteredQuery
                .Include(a => a.Doctor)
                .OrderBy(a => a.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.PatientName,
                    a.DoctorId,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : string.Empty,
                    a.StartTime,
                    a.EndTime,
                    a.Status
                })
                .ToListAsync();

            var exportRows = rows.Select(a => new AppointmentReportRowDto
            {
                AppointmentId = a.Id,
                PatientName = a.PatientName,
                DoctorId = a.DoctorId,
                DoctorName = string.IsNullOrWhiteSpace(a.DoctorName) ? "Unknown" : a.DoctorName,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status,
                DurationMinutes = (int)Math.Round(Math.Max(0, (a.EndTime - a.StartTime).TotalMinutes)),
                TimeOfDay = ResolveTimeOfDayLabel(a.StartTime)
            }).ToList();

            var headers = new[]
            {
                "AppointmentId",
                "Patient",
                "Doctor",
                "Start",
                "End",
                "Status",
                "Duration (min)",
                "TimeOfDay"
            };

            var stringRows = exportRows.Select(r => new[]
            {
                r.AppointmentId.ToString(CultureInfo.InvariantCulture),
                r.PatientName,
                r.DoctorName,
                r.StartTime.ToString("u", CultureInfo.InvariantCulture),
                r.EndTime.ToString("u", CultureInfo.InvariantCulture),
                r.Status,
                r.DurationMinutes.ToString(CultureInfo.InvariantCulture),
                r.TimeOfDay
            }).ToList();

            var format = string.IsNullOrWhiteSpace(request.Format)
                ? "csv"
                : request.Format.Trim().ToLowerInvariant();

            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            return format switch
            {
                "pdf" => File(BuildPdfDocument("Appointments Report", headers, stringRows), "application/pdf", $"appointments-report-{timestamp}.pdf"),
                _ => File(Encoding.UTF8.GetBytes(BuildCsv(headers, stringRows)), "text/csv", $"appointments-report-{timestamp}.csv")
            };
        }

        [HttpGet("patients")]
        public async Task<ActionResult<PatientReportResponseDto>> GetPatientReport([FromQuery] PatientReportQueryParameters? query)
        {
            query ??= new PatientReportQueryParameters();
            NormalizePatientQuery(query);

            var (filteredQuery, range) = BuildPatientReportQuery(query);
            var response = await BuildPatientReportResponseAsync(filteredQuery, range, query);

            return Ok(response);
        }

        [HttpPost("patients/export")]
        public async Task<IActionResult> ExportPatients([FromBody] PatientReportExportRequest request)
        {
            request ??= new PatientReportExportRequest();
            NormalizePatientQuery(request);

            var (filteredQuery, _) = BuildPatientReportQuery(request);

            var rows = await filteredQuery
                .OrderByDescending(p => p.RegisteredAt)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Gender,
                    p.DateOfBirth,
                    p.Phone,
                    p.Email,
                    p.RegisteredAt,
                    IsActive = _db.Appointments.Any(a => a.PatientName == p.Name),
                    LastAppointmentAt = _db.Appointments
                        .Where(a => a.PatientName == p.Name)
                        .OrderByDescending(a => a.EndTime)
                        .Select(a => (DateTime?)a.EndTime)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var exportRows = rows.Select(r => new PatientReportRowDto
            {
                Id = r.Id,
                Name = r.Name,
                Gender = r.Gender,
                DateOfBirth = r.DateOfBirth,
                Age = CalculateAge(r.DateOfBirth, DateTime.Today),
                Phone = r.Phone,
                Email = r.Email,
                RegisteredAt = r.RegisteredAt,
                IsActive = r.IsActive,
                LastAppointmentAt = r.LastAppointmentAt
            }).ToList();

            var headers = new[]
            {
                "PatientId",
                "Name",
                "Gender",
                "Age",
                "Phone",
                "Email",
                "RegisteredAt",
                "IsActive",
                "LastAppointmentAt"
            };

            var stringRows = exportRows.Select(r => new[]
            {
                r.Id.ToString(CultureInfo.InvariantCulture),
                r.Name,
                r.Gender,
                r.Age.ToString(CultureInfo.InvariantCulture),
                r.Phone,
                r.Email,
                r.RegisteredAt.ToString("u", CultureInfo.InvariantCulture),
                r.IsActive ? "Yes" : "No",
                r.LastAppointmentAt?.ToString("u", CultureInfo.InvariantCulture) ?? string.Empty
            }).ToList();

            var format = string.IsNullOrWhiteSpace(request.Format)
                ? "csv"
                : request.Format.Trim().ToLowerInvariant();

            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            return format switch
            {
                "pdf" => File(BuildPdfDocument("Patients Report", headers, stringRows), "application/pdf", $"patients-report-{timestamp}.pdf"),
                _ => File(Encoding.UTF8.GetBytes(BuildCsv(headers, stringRows)), "text/csv", $"patients-report-{timestamp}.csv")
            };
        }

        [HttpGet("doctors")]
        public async Task<ActionResult<DoctorReportResponseDto>> GetDoctorReport([FromQuery] DoctorReportQueryParameters? query)
        {
            query ??= new DoctorReportQueryParameters();
            NormalizeDoctorQuery(query);

            var data = await BuildDoctorReportDataAsync(query);
            var response = BuildDoctorReportResponse(data, query);

            return Ok(response);
        }

        [HttpPost("doctors/export")]
        public async Task<IActionResult> ExportDoctors([FromBody] DoctorReportExportRequest request)
        {
            request ??= new DoctorReportExportRequest();
            NormalizeDoctorQuery(request);

            var data = await BuildDoctorReportDataAsync(request);
            var sortedDoctors = SortDoctors(data.Doctors, data.StatsLookup, request.SortBy, request.SortDirection);

            var rows = sortedDoctors.Select(d =>
            {
                data.StatsLookup.TryGetValue(d.Id, out var stats);
                return new DoctorReportRowDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Specialty = d.Specialty,
                    Phone = d.Phone,
                    Email = d.Email,
                    TotalAppointments = stats?.Total ?? 0,
                    CompletedAppointments = stats?.Completed ?? 0,
                    ScheduledAppointments = stats?.Scheduled ?? 0,
                    CancelledAppointments = stats?.Cancelled ?? 0,
                    UtilizationRate = Math.Round(CalculateUtilization(stats), 2),
                    WorkloadLevel = ResolveWorkloadLevel(stats?.Total ?? 0, request.WorkloadThreshold ?? DefaultDoctorWorkloadThreshold)
                };
            }).ToList();

            var headers = new[]
            {
                "DoctorId",
                "Name",
                "Specialty",
                "Phone",
                "Email",
                "Total",
                "Completed",
                "Scheduled",
                "Cancelled",
                "Utilization (%)",
                "Workload"
            };

            var stringRows = rows.Select(r => new[]
            {
                r.Id.ToString(CultureInfo.InvariantCulture),
                r.Name,
                r.Specialty,
                r.Phone,
                r.Email,
                r.TotalAppointments.ToString(CultureInfo.InvariantCulture),
                r.CompletedAppointments.ToString(CultureInfo.InvariantCulture),
                r.ScheduledAppointments.ToString(CultureInfo.InvariantCulture),
                r.CancelledAppointments.ToString(CultureInfo.InvariantCulture),
                r.UtilizationRate.ToString("F2", CultureInfo.InvariantCulture),
                r.WorkloadLevel
            }).ToList();

            var format = string.IsNullOrWhiteSpace(request.Format)
                ? "csv"
                : request.Format.Trim().ToLowerInvariant();

            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            return format switch
            {
                "pdf" => File(BuildPdfDocument("Doctors Report", headers, stringRows), "application/pdf", $"doctors-report-{timestamp}.pdf"),
                _ => File(Encoding.UTF8.GetBytes(BuildCsv(headers, stringRows)), "text/csv", $"doctors-report-{timestamp}.csv")
            };
        }

        private static void NormalizeAppointmentQuery(AppointmentReportQueryParameters query)
        {
            query.Page = Math.Max(1, query.Page);
            query.PageSize = Math.Clamp(query.PageSize, 10, 200);
            query.SortBy = string.IsNullOrWhiteSpace(query.SortBy) ? "startTime" : query.SortBy.Trim();
            query.SortDirection = NormalizeSortDirection(query.SortDirection);
            query.Status = string.IsNullOrWhiteSpace(query.Status) ? null : query.Status.Trim();
            query.TimeOfDay = string.IsNullOrWhiteSpace(query.TimeOfDay) ? null : query.TimeOfDay.Trim().ToLowerInvariant();
        }

        private static void NormalizePatientQuery(PatientReportQueryParameters query)
        {
            query.Page = Math.Max(1, query.Page);
            query.PageSize = Math.Clamp(query.PageSize, 10, 200);
            query.SortBy = string.IsNullOrWhiteSpace(query.SortBy) ? "registeredAt" : query.SortBy.Trim();
            query.SortDirection = NormalizeSortDirection(query.SortDirection);
            query.Gender = string.IsNullOrWhiteSpace(query.Gender) ? null : query.Gender.Trim();
        }

        private static void NormalizeDoctorQuery(DoctorReportQueryParameters query)
        {
            query.Page = Math.Max(1, query.Page);
            query.PageSize = Math.Clamp(query.PageSize, 10, 200);
            query.SortBy = string.IsNullOrWhiteSpace(query.SortBy) ? "name" : query.SortBy.Trim();
            query.SortDirection = NormalizeSortDirection(query.SortDirection);
            query.Specialty = string.IsNullOrWhiteSpace(query.Specialty) ? null : query.Specialty.Trim();
            if (query.WorkloadThreshold.HasValue && query.WorkloadThreshold <= 0)
            {
                query.WorkloadThreshold = null;
            }
        }

        private static string NormalizeSortDirection(string? direction)
        {
            return string.Equals(direction, "asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
        }

        private (IQueryable<Appointment> Query, DateRange Range) BuildAppointmentReportQuery(AppointmentReportQueryParameters query)
        {
            var range = ResolveRange(query.StartDate, query.EndDate, DefaultAppointmentRangeDays);

            var baseQuery = _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= range.RangeStart && a.StartTime < range.RangeEndExclusive);

            if (query.DoctorId.HasValue)
            {
                baseQuery = baseQuery.Where(a => a.DoctorId == query.DoctorId.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                baseQuery = baseQuery.Where(a => a.Status == query.Status);
            }

            if (!string.IsNullOrWhiteSpace(query.TimeOfDay))
            {
                var (fromHour, toHour, wrapAround) = ResolveTimeOfDayHours(query.TimeOfDay);
                if (wrapAround && fromHour.HasValue && toHour.HasValue)
                {
                    baseQuery = baseQuery.Where(a => a.StartTime.Hour >= fromHour.Value || a.StartTime.Hour < toHour.Value);
                }
                else
                {
                    if (fromHour.HasValue)
                    {
                        baseQuery = baseQuery.Where(a => a.StartTime.Hour >= fromHour.Value);
                    }

                    if (toHour.HasValue)
                    {
                        baseQuery = baseQuery.Where(a => a.StartTime.Hour < toHour.Value);
                    }
                }
            }

            return (baseQuery, range);
        }

        private (IQueryable<Patient> Query, DateRange Range) BuildPatientReportQuery(PatientReportQueryParameters query)
        {
            var range = ResolveRange(query.RegisteredFrom, query.RegisteredTo, DefaultPatientRangeDays);

            var baseQuery = _db.Patients
                .AsNoTracking()
                .Where(p => p.RegisteredAt >= range.RangeStart && p.RegisteredAt < range.RangeEndExclusive);

            if (!string.IsNullOrWhiteSpace(query.Gender))
            {
                baseQuery = baseQuery.Where(p => p.Gender == query.Gender);
            }

            var today = DateTime.Today;

            if (query.MinAge.HasValue)
            {
                var maxDob = today.AddYears(-query.MinAge.Value);
                baseQuery = baseQuery.Where(p => p.DateOfBirth <= maxDob);
            }

            if (query.MaxAge.HasValue)
            {
                var minDob = today.AddYears(-(query.MaxAge.Value + 1)).AddDays(1);
                baseQuery = baseQuery.Where(p => p.DateOfBirth >= minDob);
            }

            if (query.IsActive.HasValue)
            {
                if (query.IsActive.Value)
                {
                    baseQuery = baseQuery.Where(p => _db.Appointments.Any(a => a.PatientName == p.Name));
                }
                else
                {
                    baseQuery = baseQuery.Where(p => !_db.Appointments.Any(a => a.PatientName == p.Name));
                }
            }

            return (baseQuery, range);
        }

        private async Task<AppointmentReportResponseDto> BuildAppointmentReportResponseAsync(
            IQueryable<Appointment> filteredQuery,
            DateRange range,
            AppointmentReportQueryParameters query)
        {
            var totalAppointments = await filteredQuery.CountAsync();
            var completed = await filteredQuery.CountAsync(a => a.Status == "Completed");
            var cancelled = await filteredQuery.CountAsync(a => a.Status == "Cancelled");
            var noShow = await filteredQuery.CountAsync(a => a.Status == "NoShow");

            double averageDuration = 0;
            if (totalAppointments > 0)
            {
                var avgTicks = await filteredQuery
                    .Select(a => a.EndTime.Ticks - a.StartTime.Ticks)
                    .AverageAsync();
                averageDuration = avgTicks / TimeSpan.TicksPerMinute;
            }

            var patientGrowth = await CalculatePatientGrowthPercentage(range);
            var doctorUtilization = await CalculateDoctorUtilizationAsync(range);

            var keyMetrics = new ReportKeyMetricsDto
            {
                TotalAppointments = totalAppointments,
                CompletionRate = totalAppointments == 0 ? 0 : Math.Round((decimal)completed / totalAppointments * 100, 2),
                CancellationRate = totalAppointments == 0 ? 0 : Math.Round((decimal)cancelled / totalAppointments * 100, 2),
                NoShowRate = totalAppointments == 0 ? 0 : Math.Round((decimal)noShow / totalAppointments * 100, 2),
                PatientGrowthPercentage = patientGrowth,
                DoctorUtilization = doctorUtilization,
                AverageVisitDurationMinutes = Math.Round(averageDuration, 1)
            };

            var trend = await BuildAppointmentTrendAsync(filteredQuery, range);
            var distribution = await BuildStatusDistributionAsync(filteredQuery, totalAppointments);
            var workload = await BuildDoctorWorkloadAsync(filteredQuery);
            var table = await BuildAppointmentTableAsync(filteredQuery, query);

            return new AppointmentReportResponseDto
            {
                Filters = new ReportFilterEchoDto
                {
                    RangeStart = range.RangeStart,
                    RangeEnd = range.RangeEnd,
                    DoctorId = query.DoctorId,
                    Status = query.Status,
                    TimeOfDay = query.TimeOfDay
                },
                KeyMetrics = keyMetrics,
                Trend = trend,
                StatusDistribution = distribution,
                DoctorWorkload = workload,
                Table = table
            };
        }

        private async Task<PatientReportResponseDto> BuildPatientReportResponseAsync(
            IQueryable<Patient> filteredQuery,
            DateRange range,
            PatientReportQueryParameters query)
        {
            var totalPatients = await filteredQuery.CountAsync();
            var activePatients = await filteredQuery.CountAsync(p => _db.Appointments.Any(a => a.PatientName == p.Name));

            var dobList = await filteredQuery.Select(p => p.DateOfBirth).ToListAsync();
            var averageAge = dobList.Count == 0
                ? 0
                : dobList.Select(d => CalculateAge(d, DateTime.Today)).Average();

            var periodLength = Math.Max(1, (range.RangeEnd - range.RangeStart).Days + 1);
            var previousEnd = range.RangeStart.AddDays(-1);
            var previousStart = previousEnd.AddDays(-periodLength + 1);

            var currentRegistrations = await _db.Patients
                .AsNoTracking()
                .CountAsync(p => p.RegisteredAt >= range.RangeStart && p.RegisteredAt <= range.RangeEnd);

            var previousRegistrations = await _db.Patients
                .AsNoTracking()
                .CountAsync(p => p.RegisteredAt >= previousStart && p.RegisteredAt <= previousEnd);

            decimal growthRate;
            if (previousRegistrations == 0)
            {
                growthRate = currentRegistrations > 0 ? 100 : 0;
            }
            else
            {
                growthRate = Math.Round(((decimal)(currentRegistrations - previousRegistrations) / previousRegistrations) * 100, 2);
            }

            var trend = await BuildPatientTrendAsync(filteredQuery, range);
            var table = await BuildPatientTableAsync(filteredQuery, query);

            return new PatientReportResponseDto
            {
                Filters = new ReportFilterEchoDto
                {
                    RangeStart = range.RangeStart,
                    RangeEnd = range.RangeEnd,
                    Gender = query.Gender,
                    MinAge = query.MinAge,
                    MaxAge = query.MaxAge,
                    IsActive = query.IsActive
                },
                Summary = new PatientReportSummaryDto
                {
                    TotalPatients = totalPatients,
                    ActivePatients = activePatients,
                    ActiveRate = totalPatients == 0 ? 0 : Math.Round((decimal)activePatients / totalPatients * 100, 2),
                    GrowthRate = growthRate,
                    AverageAge = Math.Round(averageAge, 1)
                },
                ActivityComparison = new PatientActivityComparisonDto
                {
                    RegisteredTotal = totalPatients,
                    ActiveTotal = activePatients
                },
                RegistrationTrend = trend,
                Table = table
            };
        }

        private async Task<DoctorReportData> BuildDoctorReportDataAsync(DoctorReportQueryParameters query)
        {
            var range = ResolveRange(query.StartDate, query.EndDate, DefaultDoctorRangeDays);

            var doctorsQuery = _db.Doctors.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(query.Specialty))
            {
                doctorsQuery = doctorsQuery.Where(d => d.Specialty == query.Specialty);
            }

            var doctors = await doctorsQuery.ToListAsync();

            var statsRaw = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= range.RangeStart && a.StartTime < range.RangeEndExclusive)
                .GroupBy(a => a.DoctorId)
                .Select(g => new DoctorWorkloadAggregate
                {
                    DoctorId = g.Key,
                    Total = g.Count(),
                    Completed = g.Count(a => a.Status == "Completed"),
                    Scheduled = g.Count(a => a.Status == "Scheduled"),
                    Cancelled = g.Count(a => a.Status == "Cancelled")
                })
                .ToListAsync();

            var statsLookup = statsRaw.ToDictionary(x => x.DoctorId);

            if (query.IsActive.HasValue)
            {
                doctors = query.IsActive.Value
                    ? doctors.Where(d => statsLookup.ContainsKey(d.Id)).ToList()
                    : doctors.Where(d => !statsLookup.ContainsKey(d.Id)).ToList();
            }

            if (query.WorkloadThreshold.HasValue)
            {
                var threshold = query.WorkloadThreshold.Value;
                doctors = doctors.Where(d => statsLookup.TryGetValue(d.Id, out var stats) && stats.Total >= threshold).ToList();
            }

            return new DoctorReportData
            {
                Doctors = doctors,
                StatsLookup = statsLookup,
                Range = range
            };
        }

        private DoctorReportResponseDto BuildDoctorReportResponse(DoctorReportData data, DoctorReportQueryParameters query)
        {
            var summary = BuildDoctorSummary(data.Doctors, data.StatsLookup);
            var workload = BuildDoctorWorkloadBars(data.Doctors, data.StatsLookup);
            var table = BuildDoctorTable(data.Doctors, data.StatsLookup, query);

            return new DoctorReportResponseDto
            {
                Filters = new ReportFilterEchoDto
                {
                    RangeStart = data.Range.RangeStart,
                    RangeEnd = data.Range.RangeEnd,
                    Specialty = query.Specialty,
                    IsActive = query.IsActive,
                    WorkloadThreshold = query.WorkloadThreshold
                },
                Summary = summary,
                Workload = workload,
                Table = table
            };
        }

        private async Task<decimal> CalculatePatientGrowthPercentage(DateRange range)
        {
            var periodLength = Math.Max(1, (range.RangeEnd - range.RangeStart).Days + 1);
            var previousEnd = range.RangeStart.AddDays(-1);
            var previousStart = previousEnd.AddDays(-periodLength + 1);

            var current = await _db.Patients
                .AsNoTracking()
                .CountAsync(p => p.RegisteredAt >= range.RangeStart && p.RegisteredAt <= range.RangeEnd);

            var previous = await _db.Patients
                .AsNoTracking()
                .CountAsync(p => p.RegisteredAt >= previousStart && p.RegisteredAt <= previousEnd);

            if (previous == 0)
            {
                return current > 0 ? 100 : 0;
            }

            return Math.Round(((decimal)(current - previous) / previous) * 100, 2);
        }

        private async Task<decimal> CalculateDoctorUtilizationAsync(DateRange range)
        {
            var totalDoctors = await _db.Doctors.CountAsync();
            if (totalDoctors == 0)
            {
                return 0;
            }

            var activeDoctors = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= range.RangeStart && a.StartTime < range.RangeEndExclusive)
                .Select(a => a.DoctorId)
                .Distinct()
                .CountAsync();

            return Math.Round((decimal)activeDoctors / totalDoctors * 100, 2);
        }

        private static async Task<List<StatusTrendPointDto>> BuildAppointmentTrendAsync(IQueryable<Appointment> query, DateRange range)
        {
            var aggregated = await query
                .GroupBy(a => a.StartTime.Date)
                .Select(g => new TrendAggregate
                {
                    Date = g.Key,
                    Scheduled = g.Count(a => a.Status == "Scheduled"),
                    Completed = g.Count(a => a.Status == "Completed"),
                    Cancelled = g.Count(a => a.Status == "Cancelled"),
                    Total = g.Count()
                })
                .ToListAsync();

            var lookup = aggregated.ToDictionary(a => a.Date, a => a);
            var trend = new List<StatusTrendPointDto>();

            for (var day = range.RangeStart.Date; day <= range.RangeEnd.Date; day = day.AddDays(1))
            {
                lookup.TryGetValue(day, out var data);
                trend.Add(new StatusTrendPointDto
                {
                    Date = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    Scheduled = data?.Scheduled ?? 0,
                    Completed = data?.Completed ?? 0,
                    Cancelled = data?.Cancelled ?? 0,
                    Total = data?.Total ?? 0
                });
            }

            return trend;
        }

        private static async Task<List<StatusDistributionSliceDto>> BuildStatusDistributionAsync(IQueryable<Appointment> query, int total)
        {
            if (total == 0)
            {
                return new List<StatusDistributionSliceDto>();
            }

            var slices = await query
                .GroupBy(a => a.Status)
                .Select(g => new StatusDistributionSliceDto
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            foreach (var slice in slices)
            {
                slice.Percentage = Math.Round((decimal)slice.Count / total * 100, 2);
            }

            return slices.OrderByDescending(s => s.Count).ToList();
        }

        private async Task<List<DoctorWorkloadBarDto>> BuildDoctorWorkloadAsync(IQueryable<Appointment> query)
        {
            var aggregated = await query
                .Join(_db.Doctors, a => a.DoctorId, d => d.Id, (appointment, doctor) => new
                {
                    appointment.DoctorId,
                    doctor.Name,
                    appointment.Status
                })
                .GroupBy(x => new { x.DoctorId, x.Name })
                .Select(g => new DoctorWorkloadBarDto
                {
                    DoctorId = g.Key.DoctorId,
                    DoctorName = g.Key.Name,
                    Scheduled = g.Count(x => x.Status == "Scheduled"),
                    Completed = g.Count(x => x.Status == "Completed"),
                    Cancelled = g.Count(x => x.Status == "Cancelled"),
                    Total = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .Take(20)
                .ToListAsync();

            return aggregated;
        }

        private async Task<PagedResultDto<AppointmentReportRowDto>> BuildAppointmentTableAsync(
            IQueryable<Appointment> query,
            AppointmentReportQueryParameters parameters)
        {
            var totalItems = await query.CountAsync();
            var skip = (parameters.Page - 1) * parameters.PageSize;

            var tableQuery = ApplyAppointmentSort(query, parameters.SortBy, parameters.SortDirection)
                .Include(a => a.Doctor);

            var rows = await tableQuery
                .Skip(skip)
                .Take(parameters.PageSize)
                .Select(a => new
                {
                    a.Id,
                    a.PatientName,
                    a.DoctorId,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : string.Empty,
                    a.StartTime,
                    a.EndTime,
                    a.Status
                })
                .ToListAsync();

            var dtoRows = rows.Select(a => new AppointmentReportRowDto
            {
                AppointmentId = a.Id,
                PatientName = a.PatientName,
                DoctorId = a.DoctorId,
                DoctorName = string.IsNullOrWhiteSpace(a.DoctorName) ? "Unknown" : a.DoctorName,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status,
                DurationMinutes = (int)Math.Round(Math.Max(0, (a.EndTime - a.StartTime).TotalMinutes)),
                TimeOfDay = ResolveTimeOfDayLabel(a.StartTime)
            }).ToList();

            return new PagedResultDto<AppointmentReportRowDto>
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                TotalItems = totalItems,
                Items = dtoRows
            };
        }

        private static IQueryable<Appointment> ApplyAppointmentSort(
            IQueryable<Appointment> query,
            string sortBy,
            string sortDirection)
        {
            var ascending = sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
            return sortBy.ToLowerInvariant() switch
            {
                "doctor" => ascending
                    ? query.OrderBy(a => a.Doctor != null ? a.Doctor.Name : string.Empty)
                    : query.OrderByDescending(a => a.Doctor != null ? a.Doctor.Name : string.Empty),
                "status" => ascending
                    ? query.OrderBy(a => a.Status)
                    : query.OrderByDescending(a => a.Status),
                "duration" => ascending
                    ? query.OrderBy(a => a.EndTime)
                    : query.OrderByDescending(a => a.EndTime),
                _ => ascending
                    ? query.OrderBy(a => a.StartTime)
                    : query.OrderByDescending(a => a.StartTime)
            };
        }

        private async Task<List<DailyRegistrationTrendPoint>> BuildPatientTrendAsync(
            IQueryable<Patient> query,
            DateRange range)
        {
            var aggregated = await query
                .GroupBy(p => p.RegisteredAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var lookup = aggregated.ToDictionary(x => x.Date, x => x.Count);
            var cumulative = 0;
            var result = new List<DailyRegistrationTrendPoint>();

            for (var day = range.RangeStart.Date; day <= range.RangeEnd.Date; day = day.AddDays(1))
            {
                if (lookup.TryGetValue(day, out var count))
                {
                    cumulative += count;
                }

                result.Add(new DailyRegistrationTrendPoint
                {
                    Date = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    Registered = cumulative
                });
            }

            return result;
        }

        private async Task<PagedResultDto<PatientReportRowDto>> BuildPatientTableAsync(
            IQueryable<Patient> query,
            PatientReportQueryParameters parameters)
        {
            var totalItems = await query.CountAsync();
            var skip = (parameters.Page - 1) * parameters.PageSize;

            var tableQuery = ApplyPatientSort(query, parameters.SortBy, parameters.SortDirection);

            var rows = await tableQuery
                .Skip(skip)
                .Take(parameters.PageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Gender,
                    p.DateOfBirth,
                    p.Phone,
                    p.Email,
                    p.RegisteredAt,
                    IsActive = _db.Appointments.Any(a => a.PatientName == p.Name),
                    LastAppointmentAt = _db.Appointments
                        .Where(a => a.PatientName == p.Name)
                        .OrderByDescending(a => a.EndTime)
                        .Select(a => (DateTime?)a.EndTime)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var dtoRows = rows.Select(r => new PatientReportRowDto
            {
                Id = r.Id,
                Name = r.Name,
                Gender = r.Gender,
                DateOfBirth = r.DateOfBirth,
                Age = CalculateAge(r.DateOfBirth, DateTime.Today),
                Phone = r.Phone,
                Email = r.Email,
                RegisteredAt = r.RegisteredAt,
                IsActive = r.IsActive,
                LastAppointmentAt = r.LastAppointmentAt
            }).ToList();

            return new PagedResultDto<PatientReportRowDto>
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                TotalItems = totalItems,
                Items = dtoRows
            };
        }

        private static IQueryable<Patient> ApplyPatientSort(
            IQueryable<Patient> query,
            string sortBy,
            string sortDirection)
        {
            var ascending = sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
            return sortBy.ToLowerInvariant() switch
            {
                "name" => ascending ? query.OrderBy(p => p.Name) : query.OrderByDescending(p => p.Name),
                "gender" => ascending ? query.OrderBy(p => p.Gender) : query.OrderByDescending(p => p.Gender),
                "age" => ascending ? query.OrderBy(p => p.DateOfBirth) : query.OrderByDescending(p => p.DateOfBirth),
                _ => ascending ? query.OrderBy(p => p.RegisteredAt) : query.OrderByDescending(p => p.RegisteredAt)
            };
        }

        private DoctorReportSummaryDto BuildDoctorSummary(
            IReadOnlyCollection<Doctor> doctors,
            IReadOnlyDictionary<int, DoctorWorkloadAggregate> statsLookup)
        {
            var totalDoctors = doctors.Count;
            var activeDoctors = doctors.Count(d => statsLookup.ContainsKey(d.Id));

            var totalAppointments = doctors.Sum(d => statsLookup.TryGetValue(d.Id, out var stats) ? stats.Total : 0);

            var completionRates = doctors
                .Select(d => statsLookup.TryGetValue(d.Id, out var stats) && stats.Total > 0
                    ? stats.Completed / (double)stats.Total * 100
                    : 0)
                .ToList();

            var utilizationRates = doctors
                .Select(d => CalculateUtilization(statsLookup.TryGetValue(d.Id, out var stats) ? stats : null))
                .ToList();

            return new DoctorReportSummaryDto
            {
                TotalDoctors = totalDoctors,
                ActiveDoctors = activeDoctors,
                AverageAppointmentsPerDoctor = totalDoctors == 0 ? 0 : Math.Round((double)totalAppointments / totalDoctors, 1),
                AverageCompletionRate = completionRates.Count == 0 ? 0 : Math.Round(completionRates.Average(), 2),
                AverageUtilizationRate = utilizationRates.Count == 0 ? 0 : Math.Round(utilizationRates.Average(), 2)
            };
        }

        private List<DoctorWorkloadBarDto> BuildDoctorWorkloadBars(
            IReadOnlyCollection<Doctor> doctors,
            IReadOnlyDictionary<int, DoctorWorkloadAggregate> statsLookup)
        {
            return doctors
                .Select(d =>
                {
                    statsLookup.TryGetValue(d.Id, out var stats);
                    return new DoctorWorkloadBarDto
                    {
                        DoctorId = d.Id,
                        DoctorName = d.Name,
                        Scheduled = stats?.Scheduled ?? 0,
                        Completed = stats?.Completed ?? 0,
                        Cancelled = stats?.Cancelled ?? 0,
                        Total = stats?.Total ?? 0
                    };
                })
                .OrderByDescending(d => d.Total)
                .Take(20)
                .ToList();
        }

        private PagedResultDto<DoctorReportRowDto> BuildDoctorTable(
            List<Doctor> doctors,
            IReadOnlyDictionary<int, DoctorWorkloadAggregate> statsLookup,
            DoctorReportQueryParameters parameters)
        {
            var sorted = SortDoctors(doctors, statsLookup, parameters.SortBy, parameters.SortDirection);
            var totalItems = sorted.Count;
            var skip = (parameters.Page - 1) * parameters.PageSize;
            var pageItems = sorted.Skip(skip).Take(parameters.PageSize).ToList();

            var rows = pageItems.Select(d =>
            {
                statsLookup.TryGetValue(d.Id, out var stats);
                return new DoctorReportRowDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Specialty = d.Specialty,
                    Phone = d.Phone,
                    Email = d.Email,
                    TotalAppointments = stats?.Total ?? 0,
                    CompletedAppointments = stats?.Completed ?? 0,
                    ScheduledAppointments = stats?.Scheduled ?? 0,
                    CancelledAppointments = stats?.Cancelled ?? 0,
                    UtilizationRate = Math.Round(CalculateUtilization(stats), 2),
                    WorkloadLevel = ResolveWorkloadLevel(stats?.Total ?? 0, parameters.WorkloadThreshold ?? DefaultDoctorWorkloadThreshold)
                };
            }).ToList();

            return new PagedResultDto<DoctorReportRowDto>
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                TotalItems = totalItems,
                Items = rows
            };
        }

        private static List<Doctor> SortDoctors(
            List<Doctor> doctors,
            IReadOnlyDictionary<int, DoctorWorkloadAggregate> statsLookup,
            string sortBy,
            string sortDirection)
        {
            var ascending = sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
            return sortBy.ToLowerInvariant() switch
            {
                "specialty" => ascending
                    ? doctors.OrderBy(d => d.Specialty, StringComparer.OrdinalIgnoreCase).ThenBy(d => d.Name).ToList()
                    : doctors.OrderByDescending(d => d.Specialty, StringComparer.OrdinalIgnoreCase).ThenByDescending(d => d.Name).ToList(),
                "totalappointments" => ascending
                    ? doctors.OrderBy(d => statsLookup.TryGetValue(d.Id, out var stats) ? stats.Total : 0).ThenBy(d => d.Name).ToList()
                    : doctors.OrderByDescending(d => statsLookup.TryGetValue(d.Id, out var stats) ? stats.Total : 0).ThenByDescending(d => d.Name).ToList(),
                "utilization" => ascending
                    ? doctors.OrderBy(d => CalculateUtilization(statsLookup.TryGetValue(d.Id, out var stats) ? stats : null)).ThenBy(d => d.Name).ToList()
                    : doctors.OrderByDescending(d => CalculateUtilization(statsLookup.TryGetValue(d.Id, out var stats) ? stats : null)).ThenByDescending(d => d.Name).ToList(),
                _ => ascending
                    ? doctors.OrderBy(d => d.Name, StringComparer.OrdinalIgnoreCase).ToList()
                    : doctors.OrderByDescending(d => d.Name, StringComparer.OrdinalIgnoreCase).ToList()
            };
        }

        private static double CalculateUtilization(DoctorWorkloadAggregate? stats)
        {
            if (stats == null || stats.Total == 0)
            {
                return 0;
            }

            return stats.Completed / (double)stats.Total * 100;
        }

        private static string ResolveWorkloadLevel(int totalAppointments, int threshold)
        {
            if (totalAppointments >= threshold * 1.5)
            {
                return "High";
            }

            if (totalAppointments >= threshold)
            {
                return "Medium";
            }

            return "Low";
        }

        private static string ResolveTimeOfDayLabel(DateTime dateTime)
        {
            var hour = dateTime.Hour;
            return hour switch
            {
                >= 5 and < 12 => "Morning",
                >= 12 and < 17 => "Afternoon",
                >= 17 and < 21 => "Evening",
                _ => "Night"
            };
        }

        private static (int? FromHour, int? ToHour, bool WrapAround) ResolveTimeOfDayHours(string? timeOfDay)
        {
            return timeOfDay switch
            {
                "morning" => (5, 12, false),
                "afternoon" => (12, 17, false),
                "evening" => (17, 21, false),
                "night" => (21, 5, true),
                _ => (null, null, false)
            };
        }

        private static int CalculateAge(DateTime dateOfBirth, DateTime pivot)
        {
            var age = pivot.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > pivot.AddYears(-age))
            {
                age--;
            }

            return Math.Max(age, 0);
        }

        private static string BuildCsv(IReadOnlyList<string> headers, IReadOnlyList<string[]> rows)
        {
            var builder = new StringBuilder();
            builder.AppendLine(string.Join(',', headers.Select(EscapeCsv)));
            foreach (var row in rows)
            {
                builder.AppendLine(string.Join(',', row.Select(EscapeCsv)));
            }

            return builder.ToString();
        }

        private static string EscapeCsv(string value)
        {
            var sanitized = value ?? string.Empty;
            if (sanitized.Contains('"') || sanitized.Contains(',') || sanitized.Contains('\n') || sanitized.Contains('\r'))
            {
                sanitized = $"\"{sanitized.Replace("\"", "\"\"")}\"";
            }

            return sanitized;
        }

        private byte[] BuildPdfDocument(string title, IReadOnlyList<string> headers, IReadOnlyList<string[]> rows)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(25);
                    page.Size(PageSizes.A4);
                    page.Header().Text(title).FontSize(18).SemiBold();
                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            foreach (var _ in headers)
                            {
                                columns.RelativeColumn();
                            }
                        });

                        table.Header(header =>
                        {
                            foreach (var headerText in headers)
                            {
                                header.Cell().Element(PdfCellStyle).Text(headerText).SemiBold();
                            }
                        });

                        foreach (var row in rows)
                        {
                            foreach (var cell in row)
                            {
                                table.Cell().Element(PdfCellStyle).Text(cell);
                            }
                        }
                    });
                });
            });

            return document.GeneratePdf();
        }

        private static IContainer PdfCellStyle(IContainer container)
        {
            return container
                .Border(0.5f)
                .BorderColor(Colors.Grey.Lighten2)
                .PaddingVertical(4)
                .PaddingHorizontal(6);
        }

        private static DateRange ResolveRange(DateTime? start, DateTime? end, int fallbackDays)
        {
            var rangeStart = (start ?? DateTime.Today.AddDays(-(fallbackDays - 1))).Date;
            var rangeEnd = (end ?? DateTime.Today).Date;

            if (rangeEnd < rangeStart)
            {
                (rangeStart, rangeEnd) = (rangeEnd, rangeStart);
            }

            return new DateRange(rangeStart, rangeEnd);
        }

        private sealed record DateRange(DateTime RangeStart, DateTime RangeEnd)
        {
            public DateTime RangeEndExclusive => RangeEnd.AddDays(1);
        }

        private sealed class DoctorWorkloadAggregate
        {
            public int DoctorId { get; set; }
            public int Total { get; set; }
            public int Completed { get; set; }
            public int Scheduled { get; set; }
            public int Cancelled { get; set; }
        }

        private sealed class DoctorReportData
        {
            public List<Doctor> Doctors { get; set; } = new();
            public Dictionary<int, DoctorWorkloadAggregate> StatsLookup { get; set; } = new();
            public DateRange Range { get; set; } = new DateRange(DateTime.Today, DateTime.Today);
        }

        private sealed class TrendAggregate
        {
            public DateTime Date { get; set; }
            public int Scheduled { get; set; }
            public int Completed { get; set; }
            public int Cancelled { get; set; }
            public int Total { get; set; }
        }
    }
}
