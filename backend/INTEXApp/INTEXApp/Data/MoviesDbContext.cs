using Microsoft.EntityFrameworkCore;

namespace INTEXApp.Data
{
    public class MoviesDbContext : DbContext
    {
        public MoviesDbContext(DbContextOptions<MoviesDbContext> options) : base(options) { }

        public DbSet<MovieTitle> MoviesTitles { get; set; }
        public DbSet<MovieUser> MoviesUsers { get; set; }
        public DbSet<MovieRating> MoviesRatings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // MovieTitle mapping
            modelBuilder.Entity<MovieTitle>(entity =>
            {
                entity.ToTable("movies_titles");
                entity.HasKey(e => e.ShowId);

                entity.Property(e => e.ShowId).HasColumnName("show_id");
                entity.Property(e => e.Type).HasColumnName("type");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Director).HasColumnName("director");
                entity.Property(e => e.Cast).HasColumnName("cast");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.ReleaseYear).HasColumnName("release_year");
                entity.Property(e => e.Rating).HasColumnName("rating");
                entity.Property(e => e.Duration).HasColumnName("duration");
                entity.Property(e => e.Description).HasColumnName("description");

                // Genre columns
                entity.Property(e => e.Action).HasColumnName("Action");
                entity.Property(e => e.Adventure).HasColumnName("Adventure");
                entity.Property(e => e.AnimeSeriesInternationalTVShows).HasColumnName("Anime Series International TV Shows");
                entity.Property(e => e.BritishTVShowsDocuseriesInternationalTVShows).HasColumnName("British TV Shows Docuseries International TV Shows");
                entity.Property(e => e.Children).HasColumnName("Children");
                entity.Property(e => e.Comedies).HasColumnName("Comedies");
                entity.Property(e => e.ComediesDramasInternationalMovies).HasColumnName("Comedies Dramas International Movies");
                entity.Property(e => e.ComediesInternationalMovies).HasColumnName("Comedies International Movies");
                entity.Property(e => e.ComediesRomanticMovies).HasColumnName("Comedies Romantic Movies");
                entity.Property(e => e.CrimeTVShowsDocuseries).HasColumnName("Crime TV Shows Docuseries");
                entity.Property(e => e.Documentaries).HasColumnName("Documentaries");
                entity.Property(e => e.DocumentariesInternationalMovies).HasColumnName("Documentaries International Movies");
                entity.Property(e => e.Docuseries).HasColumnName("Docuseries");
                entity.Property(e => e.Dramas).HasColumnName("Dramas");
                entity.Property(e => e.DramasInternationalMovies).HasColumnName("Dramas International Movies");
                entity.Property(e => e.DramasRomanticMovies).HasColumnName("Dramas Romantic Movies");
                entity.Property(e => e.FamilyMovies).HasColumnName("Family Movies");
                entity.Property(e => e.Fantasy).HasColumnName("Fantasy");
                entity.Property(e => e.HorrorMovies).HasColumnName("Horror Movies");
                entity.Property(e => e.InternationalMoviesThrillers).HasColumnName("International Movies Thrillers");
                entity.Property(e => e.InternationalTVShowsRomanticTVDramas).HasColumnName("International TV Shows Romantic TV Shows TV Dramas");
                entity.Property(e => e.KidsTV).HasColumnName("Kids' TV");
                entity.Property(e => e.LanguageTVShows).HasColumnName("Language TV Shows");
                entity.Property(e => e.Musicals).HasColumnName("Musicals");
                entity.Property(e => e.NatureTV).HasColumnName("Nature TV");
                entity.Property(e => e.RealityTV).HasColumnName("Reality TV");
                entity.Property(e => e.Spirituality).HasColumnName("Spirituality");
                entity.Property(e => e.TVAction).HasColumnName("TV Action");
                entity.Property(e => e.TVComedies).HasColumnName("TV Comedies");
                entity.Property(e => e.TVDramas).HasColumnName("TV Dramas");
            });

            // MovieUser mapping
            modelBuilder.Entity<MovieUser>(entity =>
            {
                entity.ToTable("movies_users");
                entity.HasKey(e => e.UserId);

                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Age).HasColumnName("age");
                entity.Property(e => e.Gender).HasColumnName("gender");
                entity.Property(e => e.Netflix).HasColumnName("Netflix");
                entity.Property(e => e.AmazonPrime).HasColumnName("Amazon Prime");
                entity.Property(e => e.DisneyPlus).HasColumnName("Disney+");
                entity.Property(e => e.ParamountPlus).HasColumnName("Paramount+");
                entity.Property(e => e.Max).HasColumnName("Max");
                entity.Property(e => e.Hulu).HasColumnName("Hulu");
                entity.Property(e => e.AppleTVPlus).HasColumnName("Apple TV+");
                entity.Property(e => e.Peacock).HasColumnName("Peacock");
                entity.Property(e => e.City).HasColumnName("city");
                entity.Property(e => e.State).HasColumnName("state");
                entity.Property(e => e.Zip).HasColumnName("zip");
            });

            // MovieRating mapping
            modelBuilder.Entity<MovieRating>(entity =>
            {
                entity.ToTable("movies_ratings");
                entity.HasKey(e => new { e.UserId, e.ShowId });

                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.ShowId).HasColumnName("show_id");
                entity.Property(e => e.Rating).HasColumnName("rating");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
