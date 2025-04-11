using INTEXApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace INTEXApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    //[EnableCors("AllowFrontend")]
    public class MoviesTitlesController : ControllerBase
    {
        private readonly MoviesDbContext _context;
        private readonly ILogger<MoviesTitlesController> _logger;

        public MoviesTitlesController(MoviesDbContext context, ILogger<MoviesTitlesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET with pagination and optional title filter
        [HttpGet("AllMovies")]
        public IActionResult GetMovies(int pageSize = 10, int pageNum = 1, [FromQuery] string? titleFilter = null)
        {
            var query = _context.MoviesTitles.AsQueryable();

            if (!string.IsNullOrEmpty(titleFilter))
            {
                query = query.Where(m => m.Title.Contains(titleFilter));
            }

            var totalNumMovies = query.Count();

            var movies = query
                .Skip((pageNum - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var result = new
            {
                Movies = movies,
                TotalCount = totalNumMovies
            };

            return Ok(result);
        }

        // GET a single movie by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<MovieTitle>> GetById(string id)
        {
            var movie = await _context.MoviesTitles.FindAsync(id);
            if (movie == null) return NotFound();
            return movie;
        }

        // POST - Add a new movie
        [HttpPost("AddMovie")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> AddMovie([FromBody] MovieTitle newMovie)
        {
            //_context.MoviesTitles.Add(newMovie);
            //_context.SaveChanges();
            //return Ok(newMovie);
            try
            {
                // Add validation
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Log the incoming data
                _logger.LogInformation("Attempting to add movie: {Title}", newMovie.Title);

                // Add the movie to the database
                _context.MoviesTitles.Add(newMovie);
                await _context.SaveChangesAsync();

                return Ok(newMovie);
            }
            catch (Exception ex)
            {
                // Log the exception
                _logger.LogError(ex, "Error adding movie");

                // Return a more informative error
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT - Update a movie
        [Authorize(Roles = "Administrator")]
        [HttpPut("UpdateMovie/{id}")]
        public IActionResult UpdateMovie(string id, [FromBody] MovieTitle updatedMovie)
        {
            var existing = _context.MoviesTitles.Find(id);
            if (existing == null) return NotFound();

            _context.Entry(existing).CurrentValues.SetValues(updatedMovie);
            _context.SaveChanges();

            return Ok(existing);
        }

        // DELETE - Delete a movie
        [Authorize(Roles = "Administrator")]
        [HttpDelete("DeleteMovie/{id}")]
        public IActionResult DeleteMovie(string id)
        {
            var movie = _context.MoviesTitles.Find(id);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            _context.MoviesTitles.Remove(movie);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var movies = await _context.MoviesTitles
                .Select(m => new
                {
                    m.ShowId,
                    m.Title,
                    m.Rating,
                    m.Description,
                    PosterUrl = $"/MoviePosters/{m.Title.Replace(":", "").Replace("?", "").Replace("\"", "").Replace("/", "-").Trim()}.jpg"
                })
                .ToListAsync();

            return Ok(movies);
        }

        // GET - Find movie by exact title
        [HttpGet("FindByTitle")]
        public async Task<ActionResult<MovieTitle>> FindByTitle([FromQuery] string title)
        {
            if (string.IsNullOrEmpty(title))
            {
                return BadRequest("Title cannot be empty");
            }

            // Try exact match first
            var movie = await _context.MoviesTitles
                .FirstOrDefaultAsync(m => m.Title.ToLower() == title.ToLower());

            // If no exact match, try with normalized title (removing articles, etc.)
            if (movie == null)
            {
                // Remove common articles from beginning
                var normalizedTitle = title.ToLower()
                    .Replace("the ", "")
                    .Replace("a ", "")
                    .Replace("an ", "")
                    .Trim();

                movie = await _context.MoviesTitles
                    .FirstOrDefaultAsync(m => m.Title.ToLower().Replace("the ", "").Replace("a ", "").Replace("an ", "") == normalizedTitle);
            }

            // If still no match, try partial match
            if (movie == null)
            {
                // Get all movies where the title contains the search term or vice versa
                var possibleMatches = await _context.MoviesTitles
                    .Where(m => m.Title.ToLower().Contains(title.ToLower()) || title.ToLower().Contains(m.Title.ToLower()))
                    .ToListAsync();

                if (possibleMatches.Any())
                {
                    // Find the best match based on length similarity
                    movie = possibleMatches
                        .OrderBy(m => Math.Abs(m.Title.Length - title.Length))
                        .FirstOrDefault();
                }
            }

            if (movie == null)
            {
                return NotFound(new { message = $"No movie found with title: {title}" });
            }

            return Ok(movie);
        }

        // GET - Find multiple movies by titles
        [HttpPost("FindByTitles")]
        public async Task<ActionResult<IEnumerable<MovieTitle>>> FindByTitles([FromBody] List<string> titles)
        {
            if (titles == null || !titles.Any())
            {
                return BadRequest("Titles list cannot be empty");
            }

            var result = new List<MovieTitle>();
            var notFound = new List<string>();

            foreach (var title in titles)
            {
                // Try exact match first
                var movie = await _context.MoviesTitles
                    .FirstOrDefaultAsync(m => m.Title.ToLower() == title.ToLower());

                // If no exact match, try with normalized title
                if (movie == null)
                {
                    var normalizedTitle = title.ToLower()
                        .Replace("the ", "")
                        .Replace("a ", "")
                        .Replace("an ", "")
                        .Trim();

                    movie = await _context.MoviesTitles
                        .FirstOrDefaultAsync(m => m.Title.ToLower().Replace("the ", "").Replace("a ", "").Replace("an ", "") == normalizedTitle);
                }

                // If still no match, try partial match
                if (movie == null)
                {
                    var possibleMatches = await _context.MoviesTitles
                        .Where(m => m.Title.ToLower().Contains(title.ToLower()) || title.ToLower().Contains(m.Title.ToLower()))
                        .ToListAsync();

                    if (possibleMatches.Any())
                    {
                        movie = possibleMatches
                            .OrderBy(m => Math.Abs(m.Title.Length - title.Length))
                            .FirstOrDefault();
                    }
                }

                if (movie != null)
                {
                    result.Add(movie);
                }
                else
                {
                    notFound.Add(title);
                }
            }

            return Ok(new {
                FoundMovies = result,
                NotFoundTitles = notFound
            });
        }

        // GET - Get user recommendations based on identity ID
        [HttpGet("UserRecommendations/{identityId}")]
        public async Task<ActionResult<IEnumerable<MovieTitle>>> GetUserRecommendations(string identityId,
            [FromServices] UserManager<IdentityUser> userManager,
            [FromServices] RecommendationsDbContext recommendationsContext)
        {
            try
            {
                // Find the user in the ASP.NET Identity database
                var identityUser = await userManager.FindByIdAsync(identityId);
                if (identityUser == null)
                {
                    return NotFound(new { message = "Identity user not found" });
                }

                string email = identityUser.Email;
                
                // Find the corresponding user ID in the movies_users table using the email
                var movieUser = await _context.MoviesUsers
                    .FirstOrDefaultAsync(u => u.Email == email);

                // If no user found with this email, default to user ID 33
                int userId = movieUser?.UserId ?? 33;

                // Get recommendations for this user from recommendations2 table
                var recommendations = recommendationsContext.recommendations2
                    .Where(r => r.user_id == userId)
                    .ToList();

                // Get the recommended movies by their show_ids
                var movieIds = recommendations.Select(r => r.show_id).ToList();
                var recommendedMovies = await _context.MoviesTitles
                    .Where(m => movieIds.Contains(m.ShowId))
                    .ToListAsync();

                return Ok(recommendedMovies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving user recommendations: {ex.Message}" });
            }
        }
    }
}
