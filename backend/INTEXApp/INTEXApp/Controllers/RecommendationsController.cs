using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewsRecommenderApp.Data;

namespace NewsRecommenderApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommendationsController : ControllerBase
    {
        private RecommendationsDbContext _RecommendationsContext;

        public RecommendationsController(RecommendationsDbContext temp)
        {
            _RecommendationsContext = temp;
        }

        [HttpGet("AllRecommendations")]
        public IEnumerable<Recommendation> GetRecommendations()
        {
            return _RecommendationsContext.Recommendations.ToList();
        }

    }
}
