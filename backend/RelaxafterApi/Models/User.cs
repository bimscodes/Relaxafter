using System.ComponentModel.DataAnnotations;

namespace RelaxafterApi.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Staff;

    public int CompanyId { get; set; }
    public Company? Company { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
}
