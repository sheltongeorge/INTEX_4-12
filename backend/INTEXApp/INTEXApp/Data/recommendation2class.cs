using System.ComponentModel.DataAnnotations;

namespace INTEXApp.Data
{
    public class recommendation2class
    {
        [Key]
        public int id { get; set; }
        public int user_id { get; set; }
        public string category { get; set; }
        public int position { get; set; }
        public string show_id { get; set; }
        public string title { get; set; }
    }
}
