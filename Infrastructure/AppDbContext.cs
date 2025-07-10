using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Drawing;
using System.Reflection.Emit;
using System.Xml.Linq;

namespace Infrastructure
{
    public class AppDbContext : DbContext
    {
        public DbSet<Point> Points { get; set; }
        public DbSet<Comment> Comments { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Point>()
                .HasMany(p => p.Comments)
                .WithOne()
                .HasForeignKey(c => c.PointId);
        }
    }

}
