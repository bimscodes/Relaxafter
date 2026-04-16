using Microsoft.EntityFrameworkCore;
using UnwindApi.Models;

namespace UnwindApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<MoodEntry> MoodEntries => Set<MoodEntry>();
    public DbSet<MusicTrack> MusicTracks => Set<MusicTrack>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<MusicTrack>().HasData(
            new MusicTrack { Id = 1, Title = "Ocean Waves", Artist = "Nature Sounds", Category = "Nature", DurationSeconds = 300, Url = "/audio/ocean-waves.mp3" },
            new MusicTrack { Id = 2, Title = "Rainfall", Artist = "Nature Sounds", Category = "Nature", DurationSeconds = 420, Url = "/audio/rainfall.mp3" },
            new MusicTrack { Id = 3, Title = "Forest Birds", Artist = "Nature Sounds", Category = "Nature", DurationSeconds = 360, Url = "/audio/forest-birds.mp3" },
            new MusicTrack { Id = 4, Title = "Peaceful Piano", Artist = "Calm Collective", Category = "Instrumental", DurationSeconds = 240, Url = "/audio/peaceful-piano.mp3" },
            new MusicTrack { Id = 5, Title = "Ambient Dreams", Artist = "Calm Collective", Category = "Ambient", DurationSeconds = 480, Url = "/audio/ambient-dreams.mp3" },
            new MusicTrack { Id = 6, Title = "Tibetan Bowls", Artist = "Meditation Masters", Category = "Meditation", DurationSeconds = 600, Url = "/audio/tibetan-bowls.mp3" },
            new MusicTrack { Id = 7, Title = "Night Cricket", Artist = "Nature Sounds", Category = "Nature", DurationSeconds = 540, Url = "/audio/night-cricket.mp3" },
            new MusicTrack { Id = 8, Title = "Gentle Stream", Artist = "Nature Sounds", Category = "Nature", DurationSeconds = 360, Url = "/audio/gentle-stream.mp3" }
        );
    }
}
