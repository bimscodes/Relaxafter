namespace UnwindApi.DTOs;

public class SaveMoodDto
{
    public string Mood { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class MoodResponseDto
{
    public int Id { get; set; }
    public string Mood { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}
