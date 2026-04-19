using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelaxafterApi.Data;
using RelaxafterApi.DTOs;
using RelaxafterApi.Services;

namespace RelaxafterApi.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public DashboardController(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var now = DateTime.UtcNow;

        var totalStaff = await _db.Users.CountAsync(u => u.CompanyId == _current.CompanyId);
        var totalShifts = await _db.Shifts.CountAsync(s => s.CompanyId == _current.CompanyId);
        var activeSites = await _db.Sites.CountAsync(s => s.CompanyId == _current.CompanyId);
        var upcomingShifts = await _db.Shifts.CountAsync(s =>
            s.CompanyId == _current.CompanyId && s.StartTime >= now);

        return Ok(new DashboardDto(totalStaff, totalShifts, activeSites, upcomingShifts));
    }
}
