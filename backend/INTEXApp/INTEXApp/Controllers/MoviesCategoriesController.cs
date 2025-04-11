using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using INTEXApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace INTEXApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesCategoriesController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MoviesCategoriesController(MoviesDbContext context)
        {
            _context = context;
        }

        [HttpGet("AllMovies")]
        public IActionResult GetMovies(
            [FromQuery] string? category = null,
            [FromQuery] string? type = null, // "Movie", "TV Show", or null
            [FromQuery] string? titleFilter = null,
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageNum = 1)
        {
            var query = _context.MoviesTitles.AsQueryable();

            // Optional type filter
            if (!string.IsNullOrEmpty(type))
            {
                if (type == "Movie" || type == "TV Show")
                {
                    query = query.Where(m => m.Type == type);
                }
                else
                {
                    return BadRequest("Invalid type. Must be 'Movie' or 'TV Show'.");
                }
            }

            // Optional title filter
            if (!string.IsNullOrEmpty(titleFilter))
            {
                query = query.Where(m => m.Title.ToLower().Contains(titleFilter.ToLower()));
            }

            // Optional category filter
            if (!string.IsNullOrEmpty(category))
            {
                switch (category)
                {
                    case "Action & Adventure":
                        query = query.Where(m => m.Action == 1 || m.Adventure == 1 || m.TVAction == 1);
                        break;
                    case "Comedy":
                        query = query.Where(m => m.Comedies == 1 || m.ComediesDramasInternationalMovies == 1 ||
                                                 m.ComediesInternationalMovies == 1 || m.ComediesRomanticMovies == 1 ||
                                                 m.TVComedies == 1);
                        break;
                    case "Drama":
                        query = query.Where(m => m.Dramas == 1 || m.DramasInternationalMovies == 1 ||
                                                 m.DramasRomanticMovies == 1 || m.TVDramas == 1 ||
                                                 m.BritishTVShowsDocuseriesInternationalTVShows == 1);
                        break;
                    case "Documentary & Reality":
                        query = query.Where(m => m.Documentaries == 1 || m.DocumentariesInternationalMovies == 1 ||
                                                 m.Docuseries == 1 || m.CrimeTVShowsDocuseries == 1 ||
                                                 m.NatureTV == 1 || m.RealityTV == 1);
                        break;
                    case "Romance":
                        query = query.Where(m => m.ComediesRomanticMovies == 1 ||
                                                 m.InternationalTVShowsRomanticTVDramas == 1 ||
                                                 m.DramasRomanticMovies == 1);
                        break;
                    case "Thriller & Horror":
                        query = query.Where(m => m.HorrorMovies == 1 ||
                                                 m.InternationalMoviesThrillers == 1);
                        break;
                    case "Family & Kids":
                        query = query.Where(m => m.Children == 1 || m.FamilyMovies == 1 || m.KidsTV == 1);
                        break;
                    case "International & Language":
                        query = query.Where(m => m.InternationalTVShowsRomanticTVDramas == 1 ||
                                                 m.AnimeSeriesInternationalTVShows == 1 ||
                                                 m.LanguageTVShows == 1 ||
                                                 m.InternationalMoviesThrillers == 1);
                        break;
                    case "Spiritual & Musical":
                        query = query.Where(m => m.Musicals == 1 || m.Spirituality == 1);
                        break;
                    case "Fantasy & Sci-Fi":
                        query = query.Where(m => m.Fantasy == 1);
                        break;
                    default:
                        return BadRequest("Invalid category.");
                }
            }

            var totalCount = query.Count();

            var movies = query
                .Skip((pageNum - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new { Movies = movies, TotalCount = totalCount });
        }
    }
}
