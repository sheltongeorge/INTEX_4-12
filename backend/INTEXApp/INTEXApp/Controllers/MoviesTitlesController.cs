using INTEXApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEXApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MoviesTitlesController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MoviesTitlesController(MoviesDbContext context)
        {
            _context = context;
        }

        // GET with pagination and optional title filter
        [HttpGet("AllMovies")]
        public IActionResult GetMovies(int pageSize = 10, int pageNum = 1, [FromQuery] string? titleFilter = null)
        {
            var query = _context.MoviesTitles.AsQueryable();

            if (!string.IsNullOrWhiteSpace(titleFilter))
            {
                var normalizedFilter = titleFilter.Trim().ToLower();
                query = query.Where(m => m.Title.ToLower().Contains(normalizedFilter));
            }

            var totalNumMovies = query.Count();

            var movies = query
                .OrderBy(m => m.Title)
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
        public IActionResult AddMovie([FromBody] MovieTitle newMovie)
        {
            _context.MoviesTitles.Add(newMovie);
            _context.SaveChanges();
            return Ok(newMovie);
        }

        // PUT - Update a movie
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
    }
}
