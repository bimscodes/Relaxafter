using System.ComponentModel.DataAnnotations;
using RelaxafterApi.Models;

namespace RelaxafterApi.DTOs;

public record RegisterRequest(
    [Required, MaxLength(200)] string CompanyName,
    [Required, MaxLength(200)] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record RefreshRequest([Required] string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    UserDto User);

public record UserDto(
    int Id,
    string Name,
    string Email,
    UserRole Role,
    int CompanyId,
    string CompanyName);
