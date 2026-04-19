using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelaxafterApi.DTOs;
using RelaxafterApi.Services;

namespace RelaxafterApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ICurrentUser _current;

    public AuthController(IAuthService auth, ICurrentUser current)
    {
        _auth = auth;
        _current = current;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var resp = await _auth.RegisterAsync(request);
            return Ok(resp);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            return Ok(await _auth.LoginAsync(request));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest request)
    {
        try
        {
            return Ok(await _auth.RefreshAsync(request));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _auth.LogoutAsync(_current.UserId);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me([FromServices] Data.AppDbContext db)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == _current.UserId);
        if (user is null) return Unauthorized();
        var company = await db.Companies.FindAsync(user.CompanyId);
        return Ok(new UserDto(user.Id, user.Name, user.Email, user.Role, user.CompanyId, company?.Name ?? ""));
    }
}
