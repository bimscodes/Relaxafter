using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RelaxafterApi.Data;
using RelaxafterApi.DTOs;
using RelaxafterApi.Models;

namespace RelaxafterApi.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshAsync(RefreshRequest request);
    Task LogoutAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtOptions _jwt;

    public AuthService(AppDbContext db, IOptions<JwtOptions> jwt)
    {
        _db = db;
        _jwt = jwt.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == emailLower))
            throw new InvalidOperationException("Email already registered.");

        var company = new Company { Name = request.CompanyName.Trim(), SubscriptionPlan = "Free" };
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = emailLower,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Admin,
            CompanyId = company.Id
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return await IssueTokensAsync(user, company);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Email == emailLower)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        return await IssueTokensAsync(user, user.Company!);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request)
    {
        var user = await _db.Users.Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (user.RefreshTokenExpiresAt is null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh token expired.");

        return await IssueTokensAsync(user, user.Company!);
    }

    public async Task LogoutAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return;
        user.RefreshToken = null;
        user.RefreshTokenExpiresAt = null;
        await _db.SaveChangesAsync();
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, Company company)
    {
        var now = DateTime.UtcNow;
        var accessExpires = now.AddMinutes(_jwt.AccessTokenMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("companyId", user.CompanyId.ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            notBefore: now,
            expires: accessExpires,
            signingCredentials: creds);
        var access = new JwtSecurityTokenHandler().WriteToken(token);

        var refresh = GenerateRefreshToken();
        user.RefreshToken = refresh;
        user.RefreshTokenExpiresAt = now.AddDays(_jwt.RefreshTokenDays);
        await _db.SaveChangesAsync();

        return new AuthResponse(
            access,
            refresh,
            accessExpires,
            new UserDto(user.Id, user.Name, user.Email, user.Role, user.CompanyId, company.Name));
    }

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(48);
        return Convert.ToBase64String(bytes);
    }
}
