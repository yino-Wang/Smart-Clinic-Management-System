using System.ComponentModel.DataAnnotations;

namespace ClinicFlow.Api.Models;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string PatientName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string DoctorName { get; set; } = string.Empty;

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Scheduled";
}
