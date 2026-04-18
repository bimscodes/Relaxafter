using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelaxafterApi.Data;
using RelaxafterApi.DTOs;
using RelaxafterApi.Models;
using RelaxafterApi.Services;

namespace RelaxafterApi.Controllers;

[ApiController]
[Authorize]
[Route("api/shifts")]
public class ShiftsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public ShiftsController(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShiftDto>>> List(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? userId,
        [FromQuery] int? siteId)
    {
        var query = _db.Shifts
            .Include(s => s.User)
            .Include(s => s.Site)
            .Where(s => s.CompanyId == _current.CompanyId);

        if (!_current.IsManagerOrAdmin)
            query = query.Where(s => s.UserId == _current.UserId);
        else if (userId.HasValue)
            query = query.Where(s => s.UserId == userId.Value);

        if (siteId.HasValue) query = query.Where(s => s.SiteId == siteId.Value);
        if (from.HasValue) query = query.Where(s => s.EndTime >= from.Value);
        if (to.HasValue) query = query.Where(s => s.StartTime <= to.Value);

        var shifts = await query
            .OrderBy(s => s.StartTime)
            .Select(s => new ShiftDto(
                s.Id,
                s.UserId,
                s.User!.Name,
                s.SiteId,
                s.Site!.Name,
                s.Site.Color,
                s.StartTime,
                s.EndTime,
                s.Notes))
            .ToListAsync();
        return Ok(shifts);
    }

    [HttpPost]
    public async Task<ActionResult<ShiftDto>> Create([FromBody] CreateShiftRequest request)
    {
        if (!_current.IsManagerOrAdmin) return Forbid();
        if (request.EndTime <= request.StartTime)
            return BadRequest(new { message = "EndTime must be after StartTime." });

        var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId && u.CompanyId == _current.CompanyId);
        var siteExists = await _db.Sites.AnyAsync(s => s.Id == request.SiteId && s.CompanyId == _current.CompanyId);
        if (!userExists) return BadRequest(new { message = "User not found in your company." });
        if (!siteExists) return BadRequest(new { message = "Site not found in your company." });

        var shift = new Shift
        {
            UserId = request.UserId,
            SiteId = request.SiteId,
            CompanyId = _current.CompanyId,
            StartTime = request.StartTime.ToUniversalTime(),
            EndTime = request.EndTime.ToUniversalTime(),
            Notes = request.Notes?.Trim()
        };
        _db.Shifts.Add(shift);
        await _db.SaveChangesAsync();

        await _db.Entry(shift).Reference(s => s.User).LoadAsync();
        await _db.Entry(shift).Reference(s => s.Site).LoadAsync();

        return CreatedAtAction(nameof(List), new { id = shift.Id }, ToDto(shift));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ShiftDto>> Update(int id, [FromBody] UpdateShiftRequest request)
    {
        if (!_current.IsManagerOrAdmin) return Forbid();
        if (request.EndTime <= request.StartTime)
            return BadRequest(new { message = "EndTime must be after StartTime." });

        var shift = await _db.Shifts
            .Include(s => s.User)
            .Include(s => s.Site)
            .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == _current.CompanyId);
        if (shift is null) return NotFound();

        var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId && u.CompanyId == _current.CompanyId);
        var siteExists = await _db.Sites.AnyAsync(s => s.Id == request.SiteId && s.CompanyId == _current.CompanyId);
        if (!userExists) return BadRequest(new { message = "User not found in your company." });
        if (!siteExists) return BadRequest(new { message = "Site not found in your company." });

        shift.UserId = request.UserId;
        shift.SiteId = request.SiteId;
        shift.StartTime = request.StartTime.ToUniversalTime();
        shift.EndTime = request.EndTime.ToUniversalTime();
        shift.Notes = request.Notes?.Trim();

        await _db.SaveChangesAsync();
        await _db.Entry(shift).Reference(s => s.User).LoadAsync();
        await _db.Entry(shift).Reference(s => s.Site).LoadAsync();
        return Ok(ToDto(shift));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!_current.IsManagerOrAdmin) return Forbid();

        var shift = await _db.Shifts.FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == _current.CompanyId);
        if (shift is null) return NotFound();

        _db.Shifts.Remove(shift);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ShiftDto ToDto(Shift s) => new(
        s.Id,
        s.UserId,
        s.User!.Name,
        s.SiteId,
        s.Site!.Name,
        s.Site.Color,
        s.StartTime,
        s.EndTime,
        s.Notes);
}
