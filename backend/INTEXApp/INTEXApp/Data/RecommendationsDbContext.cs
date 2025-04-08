using Microsoft.EntityFrameworkCore;

namespace NewsRecommenderApp.Data
{
    public class RecommendationsDbContext : DbContext
    {
        public RecommendationsDbContext(DbContextOptions<RecommendationsDbContext> options) : base(options) { }

        public DbSet<Recommendation> Recommendations { get; set; }
    }
}
