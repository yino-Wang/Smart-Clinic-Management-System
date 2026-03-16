using System.ComponentModel.DataAnnotations;

namespace ClinicFlow.Api.Domain.Entities;

public class ClinicPreference
{
    [Key]
    public int Id { get; set; } = 1;

    [Required]
    [MaxLength(150)]
    public string ClinicName { get; set; } = "ClinicFlow Main Branch";

    [Required]
    [MaxLength(100)]
    public string BusinessHours { get; set; } = "09:00 AM - 05:00 PM";

    [Range(5, 240)]
    public int DefaultTimeSlotMinutes { get; set; } = 30;

    public bool EnableNotifications { get; set; } = true;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
