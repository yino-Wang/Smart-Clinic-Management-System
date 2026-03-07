using System.ComponentModel.DataAnnotations;

namespace ClinicFlow.Api.Application.DTOs
{
    public class UpdatePatientDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = "";

        [Required]
        public string Gender { get; set; } = "";

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Phone { get; set; } = "";

        [Required]
        public string Email { get; set; } = "";

        public string? Notes { get; set; }
    }
}
