using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Models;
using System.Reflection.Metadata.Ecma335;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;


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
