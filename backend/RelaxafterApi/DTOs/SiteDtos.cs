using System.ComponentModel.DataAnnotations;

namespace RelaxafterApi.DTOs;

public record CreateSiteRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(500)] string Address,
    [MaxLength(1000)] string? Notes,
    [MaxLength(7)] string? Color);

public record UpdateSiteRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(500)] string Address,
    [MaxLength(1000)] string? Notes,
    [MaxLength(7)] string? Color);

public record SiteDto(
    int Id,
    string Name,
    string Address,
    string? Notes,
    string Color);
