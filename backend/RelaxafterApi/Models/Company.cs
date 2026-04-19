using System.ComponentModel.DataAnnotations;

namespace RelaxafterApi.Models;

public class Company
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string SubscriptionPlan { get; set; } = "Free";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Site> Sites { get; set; } = new List<Site>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
}
