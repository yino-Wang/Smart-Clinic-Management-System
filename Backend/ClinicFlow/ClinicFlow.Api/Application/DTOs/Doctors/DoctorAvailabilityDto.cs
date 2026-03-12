namespace ClinicFlow.Api.Application.DTOs.Doctors
{
    public class DoctorAvailabilityDto
    {
        public int DoctorId { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}