namespace ClinicFlow.Api.Application.DTOs.Appointments
{
    public class CreateAppointmentDto
    {
        public string PatientName { get; set; } = string.Empty;

        public int DoctorId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string Status { get; set; } = "Scheduled";
    }
}
