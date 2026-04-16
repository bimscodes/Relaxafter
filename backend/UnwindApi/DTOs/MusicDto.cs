namespace UnwindApi.DTOs;

public class MusicTrackDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public string Url { get; set; } = string.Empty;
}
