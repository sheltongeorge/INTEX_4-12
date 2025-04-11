using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using INTEXApp.Data;

namespace INTEXApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieUsersController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MovieUsersController(MoviesDbContext context)
        {
            _context = context;
        }

        // GET: api/MovieUsers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieUser>>> GetMovieUsers()
        {
            return await _context.MoviesUsers.ToListAsync();
        }

        // GET: api/MovieUsers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MovieUser>> GetMovieUser(int id)
        {
            var movieUser = await _context.MoviesUsers.FindAsync(id);

            if (movieUser == null)
            {
                return NotFound();
            }

            return movieUser;
        }

        // POST: api/MovieUsers/AddUser
        [HttpPost("AddUser")]
        public async Task<ActionResult<MovieUser>> AddUser(MovieUser movieUser)
        {
            if (movieUser == null)
            {
                return BadRequest("Invalid user data");
            }

            try
            {
                _context.MoviesUsers.Add(movieUser);
                await _context.SaveChangesAsync();

                return Ok(movieUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/MovieUsers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovieUser(int id, MovieUser movieUser)
        {
            if (id != movieUser.UserId)
            {
                return BadRequest();
            }

            _context.Entry(movieUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieUserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/MovieUsers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovieUser(int id)
        {
            var movieUser = await _context.MoviesUsers.FindAsync(id);
            if (movieUser == null)
            {
                return NotFound();
            }

            _context.MoviesUsers.Remove(movieUser);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MovieUserExists(int id)
        {
            return _context.MoviesUsers.Any(e => e.UserId == id);
        }
    }
}
