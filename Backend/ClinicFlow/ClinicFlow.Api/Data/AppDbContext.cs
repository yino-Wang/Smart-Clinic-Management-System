using ClinicFlow.Api.Domain.Entities;
using ClinicFlow.Api.Domain.Entities.Patient;
using Microsoft.EntityFrameworkCore;

namespace ClinicFlow.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<ClinicPreference> ClinicPreferences => Set<ClinicPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ClinicPreference>().HasData(new ClinicPreference
        {
            Id = 1,
            ClinicName = "ClinicFlow Main Branch",
            BusinessHours = "09:00 AM - 05:00 PM",
            DefaultTimeSlotMinutes = 30,
            EnableNotifications = true,
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<UserAccount>().HasData(new UserAccount
        {
            Id = 1,
            Username = "admin",
            Email = "admin@clinicflow.com",
            PasswordHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
            Role = "Admin",
            LastPasswordChangedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            IsActive = true
        });
    }
}
