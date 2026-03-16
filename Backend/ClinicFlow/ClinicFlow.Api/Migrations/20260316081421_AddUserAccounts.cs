using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClinicPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClinicName = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    BusinessHours = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DefaultTimeSlotMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    EnableNotifications = table.Column<bool>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicPreferences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    LastPasswordChangedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ClinicPreferences",
                columns: new[] { "Id", "BusinessHours", "ClinicName", "DefaultTimeSlotMinutes", "EnableNotifications", "UpdatedAt" },
                values: new object[] { 1, "09:00 AM - 05:00 PM", "ClinicFlow Main Branch", 30, true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "UserAccounts",
                columns: new[] { "Id", "Email", "IsActive", "LastPasswordChangedAt", "PasswordHash", "Role", "Username" },
                values: new object[] { 1, "admin@clinicflow.com", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", "Admin", "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClinicPreferences");

            migrationBuilder.DropTable(
                name: "UserAccounts");
        }
    }
}
