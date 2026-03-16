using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicFlow.Api.Application.DTOs.Appointments;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Domain.Entities;

namespace ClinicFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var list = await _db.Appointments
            .Include(a => a.Doctor)
            .OrderByDescending(a => a.StartTime)
            .Select(a => new
            {
                a.Id,
                a.PatientName,
                a.DoctorId,
                DoctorName = a.Doctor != null ? a.Doctor.Name : string.Empty,
                DoctorSpecialty = a.Doctor != null ? a.Doctor.Specialty : string.Empty,
                a.StartTime,
                a.EndTime,
                a.Status
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("doctor/{id:int}/date/{date}")]
    public async Task<IActionResult> GetDoctorBookedSlots(int id, string date)
    {
        if (!DateTime.TryParse(date, out var targetDate))
        {
            return BadRequest("Invalid date format.");
        }

        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        var bookedSlots = await _db.Appointments
            .Where(a => a.DoctorId == id
                        && a.Status != "Cancelled"
                        && a.StartTime >= startOfDay
                        && a.StartTime < endOfDay)
            .Select(a => new
            {
                a.StartTime,
                a.EndTime
            })
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        return Ok(bookedSlots);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        if (dto.EndTime <= dto.StartTime)
        {
            return BadRequest("EndTime must be later than StartTime");
        }

        var doctorExists = await _db.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
        if (!doctorExists)
        {
            return BadRequest("DoctorId does not exist.");
        }

        var hasConflict = await _db.Appointments
            .Where(a => a.DoctorId == dto.DoctorId
                        && a.Status != "Cancelled"
                        && ((dto.StartTime >= a.StartTime && dto.StartTime < a.EndTime)
                            || (dto.EndTime > a.StartTime && dto.EndTime <= a.EndTime)
                            || (dto.StartTime <= a.StartTime && dto.EndTime >= a.EndTime)))
            .AnyAsync();

        if (hasConflict)
        {
            return Conflict(new { message = "This time slot is already booked for the selected doctor." });
        }

        var appointment = new Appointment
        {
            PatientName = dto.PatientName,
            DoctorId = dto.DoctorId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Status = dto.Status
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        var result = await _db.Appointments
            .Include(a => a.Doctor)
            .Where(a => a.Id == appointment.Id)
            .Select(a => new
            {
                a.Id,
                a.PatientName,
                a.DoctorId,
                DoctorName = a.Doctor != null ? a.Doctor.Name : string.Empty,
                DoctorSpecialty = a.Doctor != null ? a.Doctor.Specialty : string.Empty,
                a.StartTime,
                a.EndTime,
                a.Status
            })
            .FirstOrDefaultAsync();

        return CreatedAtAction(nameof(Get), new { id = appointment.Id }, result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Appointments.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        _db.Appointments.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    public record UpdateStatusDto(string Status);

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var entity = await _db.Appointments.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        var allowed = new[] { "Scheduled", "Completed", "Cancelled" };
        if (!allowed.Contains(dto.Status))
        {
            return BadRequest("Invalid status.");
        }

        entity.Status = dto.Status;
        await _db.SaveChangesAsync();

        return Ok(entity);
    }
}
