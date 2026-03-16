using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicFlow.Api.Application.DTOs.Auth;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Domain.Entities;
using ClinicFlow.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ClinicFlow.Api.Controllers;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string AccessToken, string Role);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public AuthController(IConfiguration config, AppDbContext db)
    {
        _config = config;
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username, email and password are required.");
        }

        var trimmedUsername = request.Username.Trim();
        var trimmedEmail = request.Email.Trim();
        var portal = request.Portal?.Trim() ?? "User";
        var isAdminPortal = string.Equals(portal, "Admin", StringComparison.OrdinalIgnoreCase);
        var targetRole = isAdminPortal ? "Admin" : "User";

        if (isAdminPortal)
        {
            var expectedCode = _config["AdminRegistrationCode"];
            if (string.IsNullOrWhiteSpace(expectedCode) ||
                !string.Equals(request.AdminCode, expectedCode, StringComparison.Ordinal))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Invalid admin registration code." });
            }
        }

        var usernameExists = await _db.UserAccounts.AnyAsync(u => u.Username == trimmedUsername);
        if (usernameExists)
        {
            return Conflict(new { message = "Username already exists." });
        }

        var emailExists = await _db.UserAccounts.AnyAsync(u => u.Email == trimmedEmail);
        if (emailExists)
        {
            return Conflict(new { message = "Email already exists." });
        }

        var user = new UserAccount
        {
            Username = trimmedUsername,
            Email = trimmedEmail,
            PasswordHash = SimplePasswordHasher.Hash(request.Password),
            Role = targetRole,
            LastPasswordChangedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.UserAccounts.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { user.Id, user.Username, role = user.Role });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
        {
            return Unauthorized("Invalid username or password.");
        }

        var user = await _db.UserAccounts.FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user == null || !user.IsActive || !SimplePasswordHasher.Verify(req.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid username or password.");
        }

        var jwt = _config.GetSection("Jwt");
        var issuer = jwt["Issuer"];
        var audience = jwt["Audience"];
        var key = jwt["Key"]!;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role)
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
        return Ok(new LoginResponse(accessToken, user.Role));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("Password cannot be empty.");
        }

        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username))
        {
            return Unauthorized();
        }

        var user = await _db.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null)
        {
            return Unauthorized();
        }

        if (!SimplePasswordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest("Current password is incorrect.");
        }

        if (SimplePasswordHasher.Verify(request.NewPassword, user.PasswordHash))
        {
            return BadRequest("New password must be different from the current password.");
        }

        user.PasswordHash = SimplePasswordHasher.Hash(request.NewPassword);
        user.LastPasswordChangedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Signed out" });
    }
}
