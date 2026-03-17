using System.ComponentModel.DataAnnotations;

namespace ClinicFlow.Api.Domain.Entities;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string PatientName { get; set; } = string.Empty;

    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Scheduled";

    public Doctor? Doctor { get; set; } //check relevant to doctorId

    public int? UserId { get; set; }

    public UserAccount? User { get; set; }
}
