using System.ComponentModel.DataAnnotations;

namespace RelaxafterApi.Models;

public class Shift
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int SiteId { get; set; }
    public Site? Site { get; set; }

    public int CompanyId { get; set; }
    public Company? Company { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
