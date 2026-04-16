using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnwindApi.Data;
using UnwindApi.DTOs;

namespace UnwindApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MusicController : ControllerBase
{
    private readonly AppDbContext _db;

    public MusicController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<MusicTrackDto>>> GetAll()
    {
        var tracks = await _db.MusicTracks
            .Select(t => new MusicTrackDto
            {
                Id = t.Id,
                Title = t.Title,
                Artist = t.Artist,
                Category = t.Category,
                DurationSeconds = t.DurationSeconds,
                Url = t.Url
            })
            .ToListAsync();

        return Ok(tracks);
    }

    [HttpGet("{category}")]
    [Authorize]
    public async Task<ActionResult<List<MusicTrackDto>>> GetByCategory(string category)
    {
        var tracks = await _db.MusicTracks
            .Where(t => t.Category.ToLower() == category.ToLower())
            .Select(t => new MusicTrackDto
            {
                Id = t.Id,
                Title = t.Title,
                Artist = t.Artist,
                Category = t.Category,
                DurationSeconds = t.DurationSeconds,
                Url = t.Url
            })
            .ToListAsync();

        return Ok(tracks);
    }
}
