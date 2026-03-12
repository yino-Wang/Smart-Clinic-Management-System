using ClinicFlow.Api.Application.DTOs;
using ClinicFlow.Api.Application.DTOs.Doctors;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DoctorController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors()
        {
            var doctors = await _db.Doctors
                .Select(d => new DoctorDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Specialty = d.Specialty,
                    Phone = d.Phone,
                    Email = d.Email,
                    Availability = d.Availability,
                    PhotoUrl = d.PhotoUrl,
                    Notes = d.Notes
                })
            .ToListAsync();

            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctorById(int id)
        {
            var doctor = await _db.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound(new { message = $"Doctor with id {id} not found." });
            }

            var dto = new DoctorDto
            {
                Id = doctor.Id,
                Name = doctor.Name,
                Specialty = doctor.Specialty,
                Phone = doctor.Phone,
                Email = doctor.Email,
                Availability = doctor.Availability,
                PhotoUrl = doctor.PhotoUrl,
                Notes = doctor.Notes
            };

            return Ok(dto);
        }
        [HttpPost]
        public async Task<ActionResult<DoctorDto>> CreateDoctor([FromBody] CreateDoctorDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Name is required." });
            }

            if (string.IsNullOrWhiteSpace(dto.Specialty))
            {
                return BadRequest(new { message = "Specialty is required." });
            }

            var doctor = new Doctor
            {
                Name = dto.Name,
                Specialty = dto.Specialty,
                Phone = dto.Phone,
                Email = dto.Email,
                Availability = dto.Availability,
                PhotoUrl = dto.PhotoUrl,
                Notes = dto.Notes
            };

            _db.Doctors.Add(doctor);
            await _db.SaveChangesAsync();

            var result = new DoctorDto
            {
                Id = doctor.Id,
                Name = doctor.Name,
                Specialty = doctor.Specialty,
                Phone = doctor.Phone,
                Email = doctor.Email,
                Availability = doctor.Availability,
                PhotoUrl = doctor.PhotoUrl,
                Notes = doctor.Notes
            };

            return CreatedAtAction(nameof(GetDoctorById), new { id = doctor.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DoctorDto>> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto)
        {
            var doctor = await _db.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound(new { message = $"Doctor with id {id} not found." });
            }

            doctor.Name = dto.Name;
            doctor.Specialty = dto.Specialty;
            doctor.Phone = dto.Phone;
            doctor.Email = dto.Email;
            doctor.Availability = dto.Availability;
            doctor.PhotoUrl = dto.PhotoUrl;
            doctor.Notes = dto.Notes;

            await _db.SaveChangesAsync();

            var result = new DoctorDto
            {
                Id = doctor.Id,
                Name = doctor.Name,
                Specialty = doctor.Specialty,
                Phone = doctor.Phone,
                Email = doctor.Email,
                Availability = doctor.Availability,
                PhotoUrl = doctor.PhotoUrl,
                Notes = doctor.Notes
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _db.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound(new { message = $"Doctor with id {id} not found." });
            }

            _db.Doctors.Remove(doctor);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}/availability")]
        public async Task<ActionResult<DoctorAvailabilityDto>> CheckDocotorAvailability(
            int id,
            [FromQuery] DateTime startTime,
            [FromQuery] DateTime endTime)
        {
            if (endTime <= startTime)
            {
                return BadRequest(new { message = "EndTime must be later than StartTime." });
            }

            var docotorExists = await _db.Doctors.AnyAsync(d => d.Id == id);
            if (!docotorExists)
            {
                return NotFound(new { message = $"Doctor with id {id} not found." });
            }

            var hasConflict = await _db.Appointments
                .Where(a => a.DoctorId == id
                    && a.Status != "Cancelled"
                    && (
                        // new appointment start time is in the middle of an existing appointment
                        (startTime >= a.StartTime && startTime < a.EndTime) ||
                        // new appointment end time is in the middle of an existing appointment
                        (endTime > a.StartTime && endTime <= a.EndTime) ||
                        // new appointment completely overlaps an existing appointment
                        (startTime <= a.StartTime && endTime >= a.EndTime)
                    ))
        .AnyAsync();
            return Ok(new DoctorAvailabilityDto
            {
                DoctorId = id,
                IsAvailable = !hasConflict,
                StartTime = startTime,
                EndTime = endTime
            });
        }

    }
}

