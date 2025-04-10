using INTEXApp.Data;
using Microsoft.EntityFrameworkCore;

namespace INTEXApp.Data
{
    public class RecommendationsDbContext : DbContext
    {
        public RecommendationsDbContext(DbContextOptions<RecommendationsDbContext> options) : base(options) { }

        public DbSet<recommendation1class> recommendations1 { get; set; }
        public DbSet<recommendation2class> recommendations2 { get; set; }
    }
}
