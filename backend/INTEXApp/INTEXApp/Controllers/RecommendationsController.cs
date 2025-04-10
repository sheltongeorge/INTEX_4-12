using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using INTEXApp.Data;
using System.Security.Claims;

namespace INTEXApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecommendationsController : ControllerBase
    {
        private readonly RecommendationsDbContext _RecommendationsContext;
        private readonly MoviesDbContext _MoviesContext;
        private readonly UserManager<IdentityUser> _userManager;

        public RecommendationsController(
            RecommendationsDbContext recommendationsContext,
            MoviesDbContext moviesContext,
            UserManager<IdentityUser> userManager)
        {
            _RecommendationsContext = recommendationsContext;
            _MoviesContext = moviesContext;
            _userManager = userManager;
        }

        [HttpGet("AllRecommendations1")]
        public IEnumerable<recommendation1class> GetRecommendations1()
        {
            return _RecommendationsContext.recommendations1.ToList();
        }

        [HttpGet("AllRecommendations2")]
        public IEnumerable<recommendation2class> GetRecommendations2()
        {
            return _RecommendationsContext.recommendations2.ToList();
        }

        [HttpGet("UserRecommendations/{identityId}")]
        public async Task<ActionResult<IEnumerable<recommendation2class>>> GetUserRecommendations(string identityId)
        {
            try
            {
                // Find the user in the ASP.NET Identity database
                var identityUser = await _userManager.FindByIdAsync(identityId);
                if (identityUser == null)
                {
                    return NotFound(new { message = "Identity user not found" });
                }

                string email = identityUser.Email;
                
                // Find the corresponding user ID in the movies_users table using the email
                var movieUser = await _MoviesContext.MoviesUsers
                    .FirstOrDefaultAsync(u => u.Email == email);

                // If no user found with this email, default to user ID 33
                int userId = movieUser?.UserId ?? 33;

                // Get recommendations for this user
                var recommendations = _RecommendationsContext.recommendations2
                    .Where(r => r.user_id == userId)
                    .ToList();

                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving recommendations: {ex.Message}" });
            }
        }
    }
}
