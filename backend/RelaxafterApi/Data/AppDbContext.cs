using Microsoft.EntityFrameworkCore;
using RelaxafterApi.Models;

namespace RelaxafterApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Site> Sites => Set<Site>();
    public DbSet<Shift> Shifts => Set<Shift>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Company)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Site>()
            .HasOne(s => s.Company)
            .WithMany(c => c.Sites)
            .HasForeignKey(s => s.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.User)
            .WithMany(u => u.Shifts)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Site)
            .WithMany(st => st.Shifts)
            .HasForeignKey(s => s.SiteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Company)
            .WithMany(c => c.Shifts)
            .HasForeignKey(s => s.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Shift>()
            .HasIndex(s => new { s.CompanyId, s.StartTime });
    }
}
