using System.ComponentModel.DataAnnotations;

namespace RelaxafterApi.DTOs;

public record CreateShiftRequest(
    [Required] int UserId,
    [Required] int SiteId,
    [Required] DateTime StartTime,
    [Required] DateTime EndTime,
    [MaxLength(1000)] string? Notes);

public record UpdateShiftRequest(
    [Required] int UserId,
    [Required] int SiteId,
    [Required] DateTime StartTime,
    [Required] DateTime EndTime,
    [MaxLength(1000)] string? Notes);

public record ShiftDto(
    int Id,
    int UserId,
    string UserName,
    int SiteId,
    string SiteName,
    string SiteColor,
    DateTime StartTime,
    DateTime EndTime,
    string? Notes);
