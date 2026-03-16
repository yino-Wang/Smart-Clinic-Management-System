namespace ClinicFlow.Api.Application.DTOs.Auth;

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Portal value, e.g., "Admin" or "User".
    /// </summary>
    public string Portal { get; set; } = "User";

    /// <summary>
    /// Required only when Portal is Admin.
    /// </summary>
    public string? AdminCode { get; set; }
}
