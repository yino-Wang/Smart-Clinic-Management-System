using Microsoft.EntityFrameworkCore;
using ClinicFlow.Api.Models;

namespace ClinicFlow.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Appointment> Appointments => Set<Appointment>();
}
