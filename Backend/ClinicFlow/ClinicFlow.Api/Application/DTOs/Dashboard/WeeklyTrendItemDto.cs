namespace ClinicFlow.Api.Application.DTOs.Dashboard
{
    public class WeeklyTrendItemDto
    {
        public string Date { get; set; } = string.Empty;
        public int Scheduled { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public int Total { get; set; }
    }
}
