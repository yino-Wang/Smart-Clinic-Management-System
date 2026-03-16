using ClinicFlow.Api.Application.DTOs.Dashboard;
using ClinicFlow.Api.Data;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DashboardController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// get dashboard metrics (total patients, today's appointments, active doctors, etc.)
        /// GET /api/dashboard/metrics
        /// </summary>
        [HttpGet("metrics")]
        public async Task<ActionResult<DashboardMetricsDto>> GetMetrics()
        {
            var metrics = await BuildMetricsAsync();
            return Ok(metrics);
        }

        /// <summary>
        /// get today's upcoming appointments (status = Scheduled)
        /// GET /api/dashboard/today-upcoming
        /// </summary>
        [HttpGet("today-upcoming")]
        public async Task<ActionResult<IEnumerable<TodayUpcomingAppointmentDto>>> GetTodayUpcoming()
        {
            var appointments = await BuildTodayUpcomingAsync();
            return Ok(appointments);
        }

        /// <summary>
        /// get past 7 days appointment trends (scheduled, completed, cancelled counts by day)
        /// GET /api/dashboard/weekly-trend
        /// </summary>
        [HttpGet("weekly-trend")]
        public async Task<ActionResult<IEnumerable<WeeklyTrendItemDto>>> GetWeeklyTrend()
        {
            var trend = await BuildWeeklyTrendAsync();
            return Ok(trend);
        }

        /// <summary>
        /// return combined overview data for dashboard homepage, including metrics, today's upcoming appointments, and weekly trends
        /// GET /api/dashboard/overview
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<object>> GetOverview()
        {
            var metrics = await BuildMetricsAsync();
            var todayUpcoming = await BuildTodayUpcomingAsync();
            var weeklyTrend = await BuildWeeklyTrendAsync();

            var overview = new
            {
                metrics,
                todayUpcoming,
                weeklyTrend
            };

            return Ok(overview);
        }

        /// <summary>
        /// get today's doctor workload summary (total appointments, completed, pending, cancelled counts grouped by doctor)
        /// GET /api/dashboard/doctor-workload
        /// </summary>
        [HttpGet("doctor-workload")]
        public async Task<ActionResult<IEnumerable<object>>> GetDoctorWorkload()
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var workload = await _db.Appointments
                .AsNoTracking()
                .Include(a => a.Doctor)
                .Where(a => a.StartTime >= today
                            && a.StartTime < tomorrow
                            && a.Doctor != null)
                .GroupBy(a => new { a.DoctorId, a.Doctor!.Name })
                .Select(g => new
                {
                    DoctorId = g.Key.DoctorId,
                    DoctorName = g.Key.Name,
                    TotalAppointments = g.Count(),
                    Completed = g.Count(a => a.Status == "Completed"),
                    Pending = g.Count(a => a.Status == "Scheduled"),
                    Cancelled = g.Count(a => a.Status == "Cancelled")
                })
                .OrderByDescending(x => x.TotalAppointments)
                .ToListAsync();

            return Ok(workload);
        }

        /// <summary>
        /// get recent patients
        /// GET /api/dashboard/recent-patients?limit=5
        /// </summary>
        [HttpGet("recent-patients")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentPatients([FromQuery] int limit = 5)
        {
            if (limit <= 0)
            {
                limit = 5;
            }

            var recentPatients = await _db.Patients
                .AsNoTracking()
                .OrderByDescending(p => p.Id)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Gender,
                    p.Phone,
                    p.Email
                })
                .ToListAsync();

            return Ok(recentPatients);
        }

        // =========================
        // Private helper methods
        // =========================

        private async Task<DashboardMetricsDto> BuildMetricsAsync()
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var totalPatients = await _db.Patients
                .AsNoTracking()
                .CountAsync();

            var todayAppointments = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= today && a.StartTime < tomorrow)
                .CountAsync();

           
            var activeDoctors = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= today && a.StartTime < tomorrow)
                .Select(a => a.DoctorId)
                .Distinct()
                .CountAsync();

            var completedToday = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= today
                            && a.StartTime < tomorrow
                            && a.Status == "Completed")
                .CountAsync();

            var pendingToday = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= today
                            && a.StartTime < tomorrow
                            && a.Status == "Scheduled")
                .CountAsync();

            var cancelledToday = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= today
                            && a.StartTime < tomorrow
                            && a.Status == "Cancelled")
                .CountAsync();

            return new DashboardMetricsDto
            {
                TotalPatients = totalPatients,
                TodayAppointments = todayAppointments,
                ActiveDoctors = activeDoctors,
                CompletedToday = completedToday,
                PendingToday = pendingToday,
                CancelledToday = cancelledToday
            };
        }

        private async Task<List<TodayUpcomingAppointmentDto>> BuildTodayUpcomingAsync()
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var appointments = await _db.Appointments
                .AsNoTracking()
                .Include(a => a.Doctor)
                .Where(a => a.StartTime >= today
                            && a.StartTime < tomorrow
                            && a.Status == "Scheduled")
                .OrderBy(a => a.StartTime)
                .Select(a => new TodayUpcomingAppointmentDto
                {
                    Id = a.Id,
                    PatientName = a.PatientName,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : "Unknown",
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status
                })
                .ToListAsync();

            return appointments;
        }

        private async Task<List<WeeklyTrendItemDto>> BuildWeeklyTrendAsync()
        {
            var today = DateTime.Today;
            var sevenDaysAgo = today.AddDays(-6);
            var tomorrow = today.AddDays(1);

            var appointments = await _db.Appointments
                .AsNoTracking()
                .Where(a => a.StartTime >= sevenDaysAgo && a.StartTime < tomorrow)
                .Select(a => new
                {
                    Date = a.StartTime.Date,
                    a.Status
                })
                .ToListAsync();

            var trend = Enumerable.Range(0, 7)
                .Select(i => sevenDaysAgo.AddDays(i))
                .Select(date => new WeeklyTrendItemDto
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Scheduled = appointments.Count(a => a.Date == date.Date && a.Status == "Scheduled"),
                    Completed = appointments.Count(a => a.Date == date.Date && a.Status == "Completed"),
                    Cancelled = appointments.Count(a => a.Date == date.Date && a.Status == "Cancelled"),
                    Total = appointments.Count(a => a.Date == date.Date)
                })
                .ToList();

            return trend;
        }
    }
}
