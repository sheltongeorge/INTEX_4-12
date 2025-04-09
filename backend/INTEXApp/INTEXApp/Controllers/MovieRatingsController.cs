using INTEXApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace INTEXApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieRatingsController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MovieRatingsController(MoviesDbContext context)
        {
            _context = context;
        }

        // GET: api/movieratings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieRating>>> GetAllRatings()
        {
            return await _context.MoviesRatings.ToListAsync();
        }

        // GET: api/movieratings/user
        [Authorize]
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<MovieRating>>> GetUserRatings()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            int userIdInt;
            if (!int.TryParse(userId, out userIdInt))
            {
                return BadRequest("Invalid user ID");
            }

            return await _context.MoviesRatings.Where(r => r.UserId == userIdInt).ToListAsync();
        }

        // GET: api/movieratings/user/{showId}
        [Authorize]
        [HttpGet("user/{showId}")]
        public async Task<ActionResult<MovieRating>> GetUserRatingForMovie(string showId)
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            int userIdInt;
            if (!int.TryParse(userId, out userIdInt))
            {
                return BadRequest("Invalid user ID");
            }

            var rating = await _context.MoviesRatings
                .FirstOrDefaultAsync(r => r.UserId == userIdInt && r.ShowId == showId);

            if (rating == null)
            {
                return NotFound();
            }

            return rating;
        }

        // GET: api/movieratings/movie/{showId}
        [HttpGet("movie/{showId}")]
        public async Task<ActionResult<IEnumerable<MovieRating>>> GetRatingsByMovie(string showId)
        {
            return await _context.MoviesRatings.Where(r => r.ShowId == showId).ToListAsync();
        }

        // GET: api/movieratings/averages
        [HttpGet("averages")]
        public async Task<ActionResult<Dictionary<string, object>>> GetAverageRatings()
        {
            var ratingsByMovie = await _context.MoviesRatings
                .GroupBy(r => r.ShowId)
                .Select(g => new
                {
                    ShowId = g.Key,
                    AverageRating = g.Average(r => r.Rating),
                    Count = g.Count()
                })
                .ToDictionaryAsync(
                    r => r.ShowId,
                    r => new { avg = r.AverageRating, count = r.Count } as object
                );

            return ratingsByMovie;
        }

        // POST: api/movieratings
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<MovieRating>> PostRating(MovieRating rating)
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            int userIdInt;
            if (!int.TryParse(userId, out userIdInt))
            {
                return BadRequest("Invalid user ID");
            }

            // Check if the user has already rated this movie
            var existingRating = await _context.MoviesRatings
                .FirstOrDefaultAsync(r => r.UserId == userIdInt && r.ShowId == rating.ShowId);

            if (existingRating != null)
            {
                // Update existing rating
                existingRating.Rating = rating.Rating;
                await _context.SaveChangesAsync();
                return Ok(existingRating);
            }

            // Add new rating
            rating.UserId = userIdInt;
            _context.MoviesRatings.Add(rating);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRatingsByMovie), new { showId = rating.ShowId }, rating);
        }

        [HttpGet("userratings/{email}")]
        public IActionResult GetRatingsByEmail(string email)
        {
            var normalizedEmail = email.ToUpper();

            var user = _context.MoviesUsers.FirstOrDefault(u => u.Email.ToUpper() == normalizedEmail);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var ratings = _context.MoviesRatings
                .Where(r => r.UserId == user.UserId)
                .Join(_context.MoviesTitles,
                      rating => rating.ShowId,
                      movie => movie.ShowId,
                      (rating, movie) => new
                      {
                          movie.Title,
                          rating.Rating
                      })
                .ToList();

            return Ok(ratings);
        }

    }
}