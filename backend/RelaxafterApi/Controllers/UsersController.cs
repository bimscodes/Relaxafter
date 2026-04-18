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
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _current;

    public UsersController(AppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserListItem>>> List()
    {
        if (!_current.IsManagerOrAdmin) return Forbid();

        var users = await _db.Users
            .Where(u => u.CompanyId == _current.CompanyId)
            .OrderBy(u => u.Name)
            .Select(u => new UserListItem(u.Id, u.Name, u.Email, u.Role, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<ActionResult<UserListItem>> Create([FromBody] CreateUserRequest request)
    {
        if (!_current.IsAdmin) return Forbid();

        var emailLower = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == emailLower))
            return Conflict(new { message = "Email already in use." });

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = emailLower,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            CompanyId = _current.CompanyId
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(List), new { id = user.Id },
            new UserListItem(user.Id, user.Name, user.Email, user.Role, user.CreatedAt));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserListItem>> Update(int id, [FromBody] UpdateUserRequest request)
    {
        if (!_current.IsAdmin) return Forbid();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.CompanyId == _current.CompanyId);
        if (user is null) return NotFound();

        var emailLower = request.Email.Trim().ToLowerInvariant();
        if (emailLower != user.Email &&
            await _db.Users.AnyAsync(u => u.Email == emailLower))
            return Conflict(new { message = "Email already in use." });

        user.Name = request.Name.Trim();
        user.Email = emailLower;
        user.Role = request.Role;
        if (!string.IsNullOrWhiteSpace(request.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _db.SaveChangesAsync();
        return Ok(new UserListItem(user.Id, user.Name, user.Email, user.Role, user.CreatedAt));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!_current.IsAdmin) return Forbid();
        if (id == _current.UserId) return BadRequest(new { message = "You cannot delete yourself." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.CompanyId == _current.CompanyId);
        if (user is null) return NotFound();

        var hasShifts = await _db.Shifts.AnyAsync(s => s.UserId == id);
        if (hasShifts) return BadRequest(new { message = "Cannot delete a user with shifts. Reassign or delete the shifts first." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
