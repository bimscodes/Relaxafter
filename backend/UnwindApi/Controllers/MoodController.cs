using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UnwindApi.Data;
using UnwindApi.DTOs;
using UnwindApi.Models;

namespace UnwindApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MoodController : ControllerBase
{
    private readonly AppDbContext _db;

    public MoodController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<ActionResult<MoodResponseDto>> SaveMood(SaveMoodDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var entry = new MoodEntry
        {
            Mood = dto.Mood,
            Note = dto.Note,
            UserId = userId
        };

        _db.MoodEntries.Add(entry);
        await _db.SaveChangesAsync();

        return Ok(new MoodResponseDto
        {
            Id = entry.Id,
            Mood = entry.Mood,
            Note = entry.Note,
            CreatedAt = entry.CreatedAt
        });
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<MoodResponseDto>>> GetHistory()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var entries = await _db.MoodEntries
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(30)
            .Select(m => new MoodResponseDto
            {
                Id = m.Id,
                Mood = m.Mood,
                Note = m.Note,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        return Ok(entries);
    }
}
