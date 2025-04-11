using INTEXApp;
using INTEXApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace INTEXApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MovieWatchlistController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MovieWatchlistController(MoviesDbContext context)
        {
            _context = context;
        }

        [HttpGet("{email}")]
        public IActionResult GetWatchlist(string email)
        {
            var normalizedEmail = email.ToUpper();
            var user = _context.MoviesUsers.FirstOrDefault(u => u.Email.ToUpper() == normalizedEmail);
            if (user == null) return NotFound("User not found.");

            var watchlist = _context.MovieWatchlist
                .Where(w => w.UserId == user.UserId)
                .Join(_context.MoviesTitles,
                    w => w.ShowId,
                    m => m.ShowId,
                    (w, m) => new
                    {
                        m.ShowId,
                        m.Title,
                        m.Rating,
                        m.Description
                    })
                .ToList();

            return Ok(watchlist);
        }

        [HttpPost("add/{email}")]
        public IActionResult AddToWatchlist(string email, [FromBody] string showId)
        {
            var normalizedEmail = email.ToUpper();
            var user = _context.MoviesUsers.FirstOrDefault(u => u.Email.ToUpper() == normalizedEmail);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (_context.MovieWatchlist.Any(w => w.UserId == user.UserId && w.ShowId == showId))
            {
                return Conflict("Movie already in watchlist.");
            }

            var entry = new MovieWatchlist
            {
                UserId = user.UserId,
                ShowId = showId
            };

            _context.MovieWatchlist.Add(entry);
            _context.SaveChanges();
            return Ok(entry);
        }


        [HttpDelete("{email}/{showId}")]
        public IActionResult RemoveFromWatchlist(string email, string showId)
        {
            var user = _context.MoviesUsers.FirstOrDefault(u => u.Email.ToUpper() == email.ToUpper());
            if (user == null) return NotFound();

            var entry = _context.MovieWatchlist.FirstOrDefault(w => w.UserId == user.UserId && w.ShowId == showId);
            if (entry == null) return NotFound();

            _context.MovieWatchlist.Remove(entry);
            _context.SaveChanges();
            return NoContent();
        }
    }

}
