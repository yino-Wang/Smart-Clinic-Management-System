namespace ClinicFlow.Api.Application.DTOs.Settings;

public class ClinicPreferencesDto
{
    public string ClinicName { get; set; } = string.Empty;

    public string BusinessHours { get; set; } = string.Empty;

    public int DefaultTimeSlotMinutes { get; set; } = 30;

    public bool EnableNotifications { get; set; }
}
