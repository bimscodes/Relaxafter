using System.Security.Claims;

namespace RelaxafterApi.Services;

public interface ICurrentUser
{
    int UserId { get; }
    int CompanyId { get; }
    string Role { get; }
    bool IsAdmin { get; }
    bool IsManagerOrAdmin { get; }
}

public class CurrentUser : ICurrentUser
{
    public int UserId { get; }
    public int CompanyId { get; }
    public string Role { get; }

    public CurrentUser(IHttpContextAccessor accessor)
    {
        var user = accessor.HttpContext?.User;
        UserId = int.TryParse(user?.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : 0;
        CompanyId = int.TryParse(user?.FindFirstValue("companyId"), out var cid) ? cid : 0;
        Role = user?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }

    public bool IsAdmin => Role == "Admin";
    public bool IsManagerOrAdmin => Role is "Admin" or "Manager";
}
