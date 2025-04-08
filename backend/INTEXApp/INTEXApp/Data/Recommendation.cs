using System.ComponentModel.DataAnnotations;

namespace NewsRecommenderApp.Data
{
    public class Recommendation
    {
        [Key]
        public string contentId { get; set; }
        public string if_you_liked {  get; set; }
        public string recommendation1 {  get; set; }
        public string recommendation2 { get; set; }
        public string recommendation3 {  get; set; }
        public string recommendation4 { get; set; }
        public string recommendation5 { get; set; }
    }
}
