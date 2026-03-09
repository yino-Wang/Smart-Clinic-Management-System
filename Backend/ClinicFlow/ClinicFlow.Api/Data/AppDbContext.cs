using ClinicFlow.Api.Domain.Entities;
using ClinicFlow.Api.Domain.Entities.Patient;
using ClinicFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicFlow.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Patient> Patients => Set<Patient>();

    public DbSet<Doctor> Doctors => Set<Doctor>();

}
