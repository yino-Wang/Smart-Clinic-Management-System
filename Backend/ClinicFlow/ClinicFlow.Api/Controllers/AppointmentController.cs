using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Models;
using System.Reflection.Metadata.Ecma335;

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
            .OrderByDescending(a => a.StartTime)
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Appointment input)
    {
        if (input.EndTime <= input.StartTime)
        {
            return BadRequest("EndTime must be later than StartTime");
        }

        _db.Appointments.Add(input);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Appointments.FindAsync(id);
        if (entity == null) return NotFound();

        _db.Appointments.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    public record UpdateStatusDto(string Status);

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var entity = await _db.Appointments.FindAsync(id);
        if(entity == null)
        {
            return NotFound();
        }

        var allowed = new[]
        {
            "Scheduled",
            "Completed",
            "Cancelled"
        };
        if (!allowed.Contains(dto.Status))
            return BadRequest("Invalid status.");

        entity.Status = dto.Status;
        await _db.SaveChangesAsync();

        return Ok(entity);
    }
}
