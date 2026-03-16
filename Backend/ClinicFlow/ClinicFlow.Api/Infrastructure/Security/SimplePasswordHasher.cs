using System.Security.Cryptography;
using System.Text;

namespace ClinicFlow.Api.Infrastructure.Security;

public static class SimplePasswordHasher
{
    public static string Hash(string password)
    {
        if (password is null)
        {
            throw new ArgumentNullException(nameof(password));
        }

        using var sha = SHA256.Create();
        var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        var builder = new StringBuilder(hashBytes.Length * 2);
        foreach (var b in hashBytes)
        {
            builder.Append(b.ToString("x2"));
        }

        return builder.ToString();
    }

    public static bool Verify(string password, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash))
        {
            return false;
        }

        var computed = Hash(password);
        return string.Equals(computed, storedHash, StringComparison.OrdinalIgnoreCase);
    }
}
