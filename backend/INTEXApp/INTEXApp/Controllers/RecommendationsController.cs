using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using INTEXApp.Data;

namespace INTEXApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecommendationsController : ControllerBase
    {
        private RecommendationsDbContext _RecommendationsContext;

        public RecommendationsController(RecommendationsDbContext temp)
        {
            _RecommendationsContext = temp;
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


    }
}
