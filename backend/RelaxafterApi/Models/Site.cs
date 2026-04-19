using System.ComponentModel.DataAnnotations;

namespace RelaxafterApi.Models;

public class Site
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(7)]
    public string Color { get; set; } = "#2563eb";

    public int CompanyId { get; set; }
    public Company? Company { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
}
