using INTEXApp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEXApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesTitlesController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MoviesTitlesController(MoviesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieTitle>>> GetAll()
        {
            return await _context.MoviesTitles.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MovieTitle>> GetById(string id)
        {
            var movie = await _context.MoviesTitles.FindAsync(id);
            if (movie == null) return NotFound();
            return movie;
        }
    }

}
