using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace INTEXApp.Migrations.MoviesDb
{
    /// <inheritdoc />
    public partial class AddMovieWatchlistKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "movies_ratings",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    show_id = table.Column<string>(type: "TEXT", nullable: false),
                    rating = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_ratings", x => new { x.user_id, x.show_id });
                });

            migrationBuilder.CreateTable(
                name: "movies_titles",
                columns: table => new
                {
                    show_id = table.Column<string>(type: "TEXT", nullable: false),
                    type = table.Column<string>(type: "TEXT", nullable: true),
                    title = table.Column<string>(type: "TEXT", nullable: true),
                    director = table.Column<string>(type: "TEXT", nullable: true),
                    cast = table.Column<string>(type: "TEXT", nullable: true),
                    country = table.Column<string>(type: "TEXT", nullable: true),
                    release_year = table.Column<int>(type: "INTEGER", nullable: false),
                    rating = table.Column<string>(type: "TEXT", nullable: true),
                    duration = table.Column<string>(type: "TEXT", nullable: true),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    Action = table.Column<int>(type: "INTEGER", nullable: false),
                    Adventure = table.Column<int>(type: "INTEGER", nullable: false),
                    AnimeSeriesInternationalTVShows = table.Column<int>(name: "Anime Series International TV Shows", type: "INTEGER", nullable: false),
                    BritishTVShowsDocuseriesInternationalTVShows = table.Column<int>(name: "British TV Shows Docuseries International TV Shows", type: "INTEGER", nullable: false),
                    Children = table.Column<int>(type: "INTEGER", nullable: false),
                    Comedies = table.Column<int>(type: "INTEGER", nullable: false),
                    ComediesDramasInternationalMovies = table.Column<int>(name: "Comedies Dramas International Movies", type: "INTEGER", nullable: false),
                    ComediesInternationalMovies = table.Column<int>(name: "Comedies International Movies", type: "INTEGER", nullable: false),
                    ComediesRomanticMovies = table.Column<int>(name: "Comedies Romantic Movies", type: "INTEGER", nullable: false),
                    CrimeTVShowsDocuseries = table.Column<int>(name: "Crime TV Shows Docuseries", type: "INTEGER", nullable: false),
                    Documentaries = table.Column<int>(type: "INTEGER", nullable: false),
                    DocumentariesInternationalMovies = table.Column<int>(name: "Documentaries International Movies", type: "INTEGER", nullable: false),
                    Docuseries = table.Column<int>(type: "INTEGER", nullable: false),
                    Dramas = table.Column<int>(type: "INTEGER", nullable: false),
                    DramasInternationalMovies = table.Column<int>(name: "Dramas International Movies", type: "INTEGER", nullable: false),
                    DramasRomanticMovies = table.Column<int>(name: "Dramas Romantic Movies", type: "INTEGER", nullable: false),
                    FamilyMovies = table.Column<int>(name: "Family Movies", type: "INTEGER", nullable: false),
                    Fantasy = table.Column<int>(type: "INTEGER", nullable: false),
                    HorrorMovies = table.Column<int>(name: "Horror Movies", type: "INTEGER", nullable: false),
                    InternationalMoviesThrillers = table.Column<int>(name: "International Movies Thrillers", type: "INTEGER", nullable: false),
                    InternationalTVShowsRomanticTVShowsTVDramas = table.Column<int>(name: "International TV Shows Romantic TV Shows TV Dramas", type: "INTEGER", nullable: false),
                    KidsTV = table.Column<int>(name: "Kids' TV", type: "INTEGER", nullable: false),
                    LanguageTVShows = table.Column<int>(name: "Language TV Shows", type: "INTEGER", nullable: false),
                    Musicals = table.Column<int>(type: "INTEGER", nullable: false),
                    NatureTV = table.Column<int>(name: "Nature TV", type: "INTEGER", nullable: false),
                    RealityTV = table.Column<int>(name: "Reality TV", type: "INTEGER", nullable: false),
                    Spirituality = table.Column<int>(type: "INTEGER", nullable: false),
                    TVAction = table.Column<int>(name: "TV Action", type: "INTEGER", nullable: false),
                    TVComedies = table.Column<int>(name: "TV Comedies", type: "INTEGER", nullable: false),
                    TVDramas = table.Column<int>(name: "TV Dramas", type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_titles", x => x.show_id);
                });

            migrationBuilder.CreateTable(
                name: "movies_users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: true),
                    phone = table.Column<string>(type: "TEXT", nullable: true),
                    email = table.Column<string>(type: "TEXT", nullable: true),
                    age = table.Column<int>(type: "INTEGER", nullable: true),
                    gender = table.Column<string>(type: "TEXT", nullable: true),
                    Netflix = table.Column<int>(type: "INTEGER", nullable: true),
                    AmazonPrime = table.Column<int>(name: "Amazon Prime", type: "INTEGER", nullable: true),
                    Disney = table.Column<int>(name: "Disney+", type: "INTEGER", nullable: true),
                    Paramount = table.Column<int>(name: "Paramount+", type: "INTEGER", nullable: true),
                    Max = table.Column<int>(type: "INTEGER", nullable: true),
                    Hulu = table.Column<int>(type: "INTEGER", nullable: true),
                    AppleTV = table.Column<int>(name: "Apple TV+", type: "INTEGER", nullable: true),
                    Peacock = table.Column<int>(type: "INTEGER", nullable: true),
                    city = table.Column<string>(type: "TEXT", nullable: true),
                    state = table.Column<string>(type: "TEXT", nullable: true),
                    zip = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "MovieWatchlist",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    ShowId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovieWatchlist", x => new { x.UserId, x.ShowId });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "movies_ratings");

            migrationBuilder.DropTable(
                name: "movies_titles");

            migrationBuilder.DropTable(
                name: "movies_users");

            migrationBuilder.DropTable(
                name: "MovieWatchlist");
        }
    }
}
