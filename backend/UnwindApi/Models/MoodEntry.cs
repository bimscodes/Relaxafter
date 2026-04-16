namespace UnwindApi.Models;

public class MoodEntry
{
    public int Id { get; set; }
    public string Mood { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
