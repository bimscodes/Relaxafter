namespace RelaxafterApi.DTOs;

public record DashboardDto(
    int TotalStaff,
    int TotalShifts,
    int ActiveSites,
    int UpcomingShifts);
