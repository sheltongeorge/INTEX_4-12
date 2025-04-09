using Microsoft.AspNetCore.Http;
using INTEXApp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEXApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieUsersController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MovieUsersController(MoviesDbContext context)
        {
            _context = context;
        }

        // POST: api/MovieUsers/AddUser
        [HttpPost("AddUser")]
        public IActionResult AddUser([FromBody] MovieUser newUser)
        {
            try
            {
                int maxId = _context.MoviesUsers.Any()
                    ? _context.MoviesUsers.Max(u => u.UserId)
                    : 200;

                newUser.UserId = maxId + 1;

                // Default other fields to null or 0
                newUser.Phone = null;
                newUser.Age = null;
                newUser.Gender = null;
                newUser.Netflix = 0;
                newUser.AmazonPrime = 0;
                newUser.DisneyPlus = 0;
                newUser.ParamountPlus = 0;
                newUser.Max = 0;
                newUser.Hulu = 0;
                newUser.AppleTVPlus = 0;
                newUser.Peacock = 0;
                newUser.City = null;
                newUser.State = null;
                newUser.Zip = null;

                _context.MoviesUsers.Add(newUser);
                _context.SaveChanges();

                return Ok(newUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Could not create movie user", details = ex.Message });
            }
        }
    }
}
