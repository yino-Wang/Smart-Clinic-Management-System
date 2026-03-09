namespace ClinicFlow.Api.Application.DTOs.Doctors
{
    public class CreateDoctorDto
    {
        public string Name { get; set; } = "";

        public string Specialty { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Email { get; set; } = "";

        public string Availability { get; set; } = "";

        public string? Notes { get; set; }
    }
}
