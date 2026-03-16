using ClinicFlow.Api.Application.DTOs.Settings;
using ClinicFlow.Api.Data;
using ClinicFlow.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("clinic-preferences")]
    public async Task<ActionResult<ClinicPreferencesDto>> GetClinicPreferences()
    {
        var entity = await EnsurePreferencesAsync();
        return Ok(MapToDto(entity));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("clinic-preferences")]
    public async Task<ActionResult<ClinicPreferencesDto>> UpdateClinicPreferences([FromBody] ClinicPreferencesDto dto)
    {
        if (dto.DefaultTimeSlotMinutes <= 0)
        {
            return BadRequest("Default time slot must be greater than zero.");
        }

        var entity = await EnsurePreferencesAsync();
        entity.ClinicName = dto.ClinicName;
        entity.BusinessHours = dto.BusinessHours;
        entity.DefaultTimeSlotMinutes = dto.DefaultTimeSlotMinutes;
        entity.EnableNotifications = dto.EnableNotifications;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(MapToDto(entity));
    }

    private async Task<ClinicPreference> EnsurePreferencesAsync()
    {
        var entity = await _db.ClinicPreferences.FirstOrDefaultAsync();
        if (entity != null)
        {
            return entity;
        }

        var created = new ClinicPreference();
        _db.ClinicPreferences.Add(created);
        await _db.SaveChangesAsync();
        return created;
    }

    private static ClinicPreferencesDto MapToDto(ClinicPreference entity) => new()
    {
        ClinicName = entity.ClinicName,
        BusinessHours = entity.BusinessHours,
        DefaultTimeSlotMinutes = entity.DefaultTimeSlotMinutes,
        EnableNotifications = entity.EnableNotifications
    };
}
