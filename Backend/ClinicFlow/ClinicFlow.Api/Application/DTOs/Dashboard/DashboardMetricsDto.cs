namespace ClinicFlow.Api.Application.DTOs.Dashboard
{
    public class DashboardMetricsDto
    {
        public int TotalPatients { get; set; }
        public int TodayAppointments { get; set; }
        public int ActiveDoctors { get; set; }
        public int CompletedToday { get; set; }
        public int PendingToday { get; set; }
        public int CancelledToday { get; set; }
    }
}
