using System.ComponentModel.DataAnnotations;

namespace ClinicFlow.Api.Domain.Entities;

public class UserAccount
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "User";

    public DateTime LastPasswordChangedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
}
