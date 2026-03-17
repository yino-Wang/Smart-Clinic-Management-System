using ClinicFlow.Api.Data;
using ClinicFlow.Api.Domain.Entities.Patient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicFlow.Api.Application.DTOs.Patients;
using Microsoft.AspNetCore.Authorization;

namespace ClinicFlow.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PatientsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            var patients = await _db.Patients
                            .Select(p => new PatientDto
                            {
                                Id = p.Id,
                                Name = p.Name,
                                Gender = p.Gender,
                                DateOfBirth = p.DateOfBirth,
                                Phone = p.Phone,
                                Email = p.Email,
                                Notes = p.Notes
                            })
                            .ToListAsync();

            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatientById(int id)
        {
            var patient = await _db.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound(new { message = $"Patient with id {id} not found." });
            }

            var dto = new PatientDto
            {
                Id = patient.Id,
                Name = patient.Name,
                Gender = patient.Gender,
                DateOfBirth = patient.DateOfBirth,
                Phone = patient.Phone,
                Email = patient.Email,
                Notes = patient.Notes
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Patient name is required." });
            }

            var patient = new Patient
            {
                Name = dto.Name,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                Phone = dto.Phone,
                Email = dto.Email,
                Notes = dto.Notes
            };

            _db.Patients.Add(patient);
            await _db.SaveChangesAsync();

            var result = new PatientDto
            {
                Id = patient.Id,
                Name = patient.Name,
                Gender = patient.Gender,
                DateOfBirth = patient.DateOfBirth,
                Phone = patient.Phone,
                Email = patient.Email,
                Notes = patient.Notes
            };

            return CreatedAtAction(nameof(GetPatientById), new { id = patient.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PatientDto>> UpdatePatient(int id, [FromBody] UpdatePatientDto dto)
        {
            var patient = await _db.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound(new { message = $"Patient with id {id} not found." });
            }

            patient.Name = dto.Name;
            patient.Gender = dto.Gender;
            patient.DateOfBirth = dto.DateOfBirth;
            patient.Phone = dto.Phone;
            patient.Email = dto.Email;
            patient.Notes = dto.Notes;

            await _db.SaveChangesAsync();

            var result = new PatientDto
            {
                Id = patient.Id,
                Name = patient.Name,
                Gender = patient.Gender,
                DateOfBirth = patient.DateOfBirth,
                Phone = patient.Phone,
                Email = patient.Email,
                Notes = patient.Notes
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _db.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound(new { message = $"Patient with id {id} not found." });
            }

            _db.Patients.Remove(patient);
            await _db.SaveChangesAsync();

            return NoContent();
        }


    }
}