using System.ComponentModel.DataAnnotations;
using RelaxafterApi.Models;

namespace RelaxafterApi.DTOs;

public record CreateUserRequest(
    [Required, MaxLength(200)] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required] UserRole Role);

public record UpdateUserRequest(
    [Required, MaxLength(200)] string Name,
    [Required, EmailAddress] string Email,
    [Required] UserRole Role,
    string? Password);

public record UserListItem(
    int Id,
    string Name,
    string Email,
    UserRole Role,
    DateTime CreatedAt);
