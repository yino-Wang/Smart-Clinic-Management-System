using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicFlow.Api.Data;
using System.Reflection.Metadata.Ecma335;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using ClinicFlow.Api.Domain.Entities;
using ClinicFlow.Api.Application.DTOs.Appointments;


namespace ClinicFlow.Api.Controllers;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string AccessToken, string Role);

//[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    private static readonly Dictionary<string, (string Password, string Role)> Users = new()
    {
        ["admin"] = ("admin123", "Admin"),
        ["user"] = ("user123", "User")
    };
    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        if (!Users.TryGetValue(req.Username, out var u) || u.Password != req.Password)
            return Unauthorized("Invalid username or password.");

        var jwt = _config.GetSection("Jwt");
        var issuer = jwt["Issuer"];
        var audience = jwt["Audience"];
        var key = jwt["Key"]!;

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, req.Username),
            new(ClaimTypes.Role, u.Role)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(new LoginResponse(accessToken, u.Role));
    }
}

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
                DoctorName = a.Doctor != null ? a.Doctor.Name : "",
                DoctorSpecialty = a.Doctor != null ? a.Doctor.Specialty : "",
                a.StartTime,
                a.EndTime,
                a.Status
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        if (dto.EndTime <= dto.StartTime)
        {
            return BadRequest("EndTime must be later than StartTime");
        }

        var doctorExists = await _db.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
        if(!doctorExists)
        {
            return BadRequest("DoctorId does not exist.");
        }

        var hasConflict = await _db.Appointments
            .Where(a => a.DoctorId == dto.DoctorId
                        && a.Status != "Cancelled"
                        && (
                            (dto.StartTime >= a.StartTime && dto.StartTime < a.EndTime) ||
                            (dto.EndTime > a.StartTime && dto.EndTime <= a.EndTime) ||
                            (dto.StartTime <= a.StartTime && dto.EndTime >= a.EndTime)
                        ))
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
                DoctorName = a.Doctor != null ? a.Doctor.Name : "",
                DoctorSpecialty = a.Doctor != null ? a.Doctor.Specialty : "",
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
