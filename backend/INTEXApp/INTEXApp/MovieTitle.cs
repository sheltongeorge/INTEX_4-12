using System.ComponentModel.DataAnnotations.Schema;

namespace INTEXApp
{
    public class MovieTitle
    {
        public string? ShowId { get; set; }
        public string? Type { get; set; }
        public string? Title { get; set; }
        public string? Director { get; set; }
        public string? Cast { get; set; }
        public string? Country { get; set; }
        public int ReleaseYear { get; set; }
        public string? Rating { get; set; }
        public string? Duration { get; set; }
        public string? Description { get; set; }

        // Genre flags (1 or 0)
        public int Action { get; set; }
        public int Adventure { get; set; }
        public int AnimeSeriesInternationalTVShows { get; set; }
        public int BritishTVShowsDocuseriesInternationalTVShows { get; set; }
        public int Children { get; set; }
        public int Comedies { get; set; }
        public int ComediesDramasInternationalMovies { get; set; }
        public int ComediesInternationalMovies { get; set; }
        public int ComediesRomanticMovies { get; set; }
        public int CrimeTVShowsDocuseries { get; set; }
        public int Documentaries { get; set; }
        public int DocumentariesInternationalMovies { get; set; }
        public int Docuseries { get; set; }
        public int Dramas { get; set; }
        public int DramasInternationalMovies { get; set; }
        public int DramasRomanticMovies { get; set; }
        public int FamilyMovies { get; set; }
        public int Fantasy { get; set; }
        public int HorrorMovies { get; set; }
        public int InternationalMoviesThrillers { get; set; }
        public int InternationalTVShowsRomanticTVDramas { get; set; }
        public int KidsTV { get; set; }
        public int LanguageTVShows { get; set; }
        public int Musicals { get; set; }
        public int NatureTV { get; set; }
        public int RealityTV { get; set; }
        public int Spirituality { get; set; }
        public int TVAction { get; set; }
        public int TVComedies { get; set; }
        public int TVDramas { get; set; }

        [NotMapped]
        public string PosterUrl
        {
            get
            {
                var fileName = Title.Replace(":", "")
                                    .Replace("\"", "")
                                    .Replace("?", "")
                                    .Replace("/", "-")
                                    .Replace("\\", "-")
                                    .Replace("*", "")
                                    .Replace("<", "")
                                    .Replace(">", "")
                                    .Replace("|", "")
                                    .Trim();
                return $"/MoviePosters/{fileName}.jpg";
            }
        }
        }



}
