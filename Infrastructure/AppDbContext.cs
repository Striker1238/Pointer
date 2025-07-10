using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure
{
    public class AppDbContext : DbContext
    {
        public DbSet<Point> Points { get; set; }
        public DbSet<Comment> Comments { get; set; }

        public AppDbContext()
        {
            Database.EnsureCreatedAsync();
        }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseInMemoryDatabase("Pointers");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Point>()
                .HasMany(p => p.Comments)
                .WithOne()
                .HasForeignKey(c => c.PointId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
