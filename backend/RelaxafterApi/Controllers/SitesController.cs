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
[Route("api/sites")]
public class SitesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public SitesController(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SiteDto>>> List()
    {
        var sites = await _db.Sites
            .Where(s => s.CompanyId == _current.CompanyId)
            .OrderBy(s => s.Name)
            .Select(s => new SiteDto(s.Id, s.Name, s.Address, s.Notes, s.Color))
            .ToListAsync();
        return Ok(sites);
    }

    [HttpPost]
    public async Task<ActionResult<SiteDto>> Create([FromBody] CreateSiteRequest request)
    {
        if (!_current.IsManagerOrAdmin) return Forbid();

        var site = new Site
        {
            Name = request.Name.Trim(),
            Address = request.Address?.Trim() ?? string.Empty,
            Notes = request.Notes?.Trim(),
            Color = string.IsNullOrWhiteSpace(request.Color) ? "#2563eb" : request.Color!,
            CompanyId = _current.CompanyId
        };
        _db.Sites.Add(site);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(List), new { id = site.Id },
            new SiteDto(site.Id, site.Name, site.Address, site.Notes, site.Color));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SiteDto>> Update(int id, [FromBody] UpdateSiteRequest request)
    {
        if (!_current.IsManagerOrAdmin) return Forbid();

        var site = await _db.Sites.FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == _current.CompanyId);
        if (site is null) return NotFound();

        site.Name = request.Name.Trim();
        site.Address = request.Address?.Trim() ?? string.Empty;
        site.Notes = request.Notes?.Trim();
        if (!string.IsNullOrWhiteSpace(request.Color)) site.Color = request.Color!;

        await _db.SaveChangesAsync();
        return Ok(new SiteDto(site.Id, site.Name, site.Address, site.Notes, site.Color));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!_current.IsAdmin) return Forbid();

        var site = await _db.Sites.FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == _current.CompanyId);
        if (site is null) return NotFound();

        var hasShifts = await _db.Shifts.AnyAsync(s => s.SiteId == id);
        if (hasShifts) return BadRequest(new { message = "Cannot delete a site with shifts. Remove or reassign the shifts first." });

        _db.Sites.Remove(site);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
