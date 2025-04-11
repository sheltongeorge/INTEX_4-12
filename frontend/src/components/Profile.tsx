import { useEffect, useState, useContext } from 'react';
import { UserContext } from './AuthorizeView';
import fallbackImage from '../assets/Fallback.png';
import './Profile.css';
import './MovieCarousel.css';
import Header from '../components/Header';
import MovieOverlay from '../components/MovieOverlay'; // adjust path if needed
import ProfileStats from '../components/ProfileStats';
import ViewingBadge from '../components/Viewingbadge';




const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN =
  'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-15T09:35:14Z&st=2025-04-09T01:35:14Z&spr=https,http&sig=N%2FAK8dhBBarxwU9qBSd0aI0B5iEOqmpnKUJ6Ek1yv0k%3D';
const CONTAINER_NAME = 'movieposters';


const getPosterImageUrl = (movieTitle: string): string => {
  const blobPath = `${encodeURIComponent(movieTitle)}.jpg`;
  return `${BLOB_STORAGE_URL}/${CONTAINER_NAME}/${blobPath}?${BLOB_SAS_TOKEN}`;
};

const StarRatingDisplay = ({ rating }: { rating: number }) => {
  const normalizedRating = Math.round(rating / 1); // ensure it's normalized correctly

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${normalizedRating >= star ? 'filled' : ''}`}>
          
        </span>
      ))}
    </div>
  );
};



type UserRating = {
  showId: string;
  title: string;
  rating: number;
};

type WatchlistMovie = {
  showId: string;
  title: string;
  rating?: string;
  description?: string;
};

const RatingCard = ({ rating, onClick }: { rating: UserRating; onClick: () => void }) => {
  const [isFallback, setIsFallback] = useState(false);


  return (
    <div className="rating-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="poster-thumbnail">
        <img
          src={getPosterImageUrl(rating.title)}
          alt={rating.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
            setIsFallback(true);
          }}
        />
        {isFallback && <div className="fallback-overlay-title">{rating.title}</div>}
      </div>
      <div className="rating-info">
        <h3>{rating.title}</h3>
        <StarRatingDisplay rating={rating.rating} />
        {rating.rating > 0 && <p>{rating.rating}/5</p>}
      </div>
    </div>
  );
};




const Profile = () => {
  const user = useContext(UserContext);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<WatchlistMovie | UserRating | null>(null);
    const [userRating, setUserRating] = useState<number | null>(null);
    const totalWatched = ratings.length;
    const [favoriteGenre, setFavoriteGenre] = useState<string>('Loading...');
    const [averageRating, setAverageRating] = useState('N/A');
const [timeWatchedHours, setTimeWatchedHours] = useState(0);
const [profileTitle, setProfileTitle] = useState('Movie Enthusiast');




    useEffect(() => {
      const fetchData = async () => {
        if (!user?.email) return;
    
        // 1. Fetch ratings
        const ratingsRes = await fetch(
          `https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/movieratings/userratings/${encodeURIComponent(user.email)}`,
          { credentials: 'include' }
        );
    
        if (ratingsRes.ok) {
          const ratingsData: UserRating[] = await ratingsRes.json();
          setRatings(ratingsData);
    
          // 2. Calculate average rating
          const avgRating = ratingsData.length > 0
            ? (ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length).toFixed(1)
            : 'N/A';
          setAverageRating(avgRating);
    
          // 3. Estimate time spent watching (2 hours per movie)
          const estimatedTime = ratingsData.length * 2;
          setTimeWatchedHours(estimatedTime);
    
          // 4. Fetch genres based on rated movie titles
          const titles = ratingsData.map((r: any) => r.title);
          try {
            // First fetch the detailed movie data for all rated movies
            const genreRes = await fetch(`https://localhost:7156/api/moviestitles/FindByTitles`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(titles),
              credentials: 'include'
            });
      
            let genre = 'N/A';
            let genreCounts: Record<string, number> = {};
      
            if (genreRes.ok) {
              const genreData = await genreRes.json();
              console.log("Found movies for genre calculation:", genreData.foundMovies?.length || 0);
              
              // Default genre assignment for testing
              if (!genreData.foundMovies || genreData.foundMovies.length === 0) {
                // If we can't get movie genre data, assign a default based on ratings
                if (ratingsData.length > 0) {
                  // Pick a random default genre based on the user's first rated movie
                  const defaultGenres = [
                    'Action & Adventure', 'Comedy', 'Drama', 'Thriller & Horror', 'Romance'
                  ];
                  const randomIndex = Math.floor(Math.random() * defaultGenres.length);
                  setFavoriteGenre(defaultGenres[randomIndex]);
                  return;
                }
              }
              
              // Check for listed_in field which has genre information
              genreData.foundMovies?.forEach((movie: any) => {
                // Try the listed_in field first if it exists
                if (movie.listed_in) {
                  const listedGenres = movie.listed_in.split(',').map((g: string) => g.trim());
                  listedGenres.forEach((genreName: string) => {
                    // Map to our standard genre names
                    let mappedGenre = genreName;
                    if (genreName.includes('Action') || genreName.includes('Adventure'))
                      mappedGenre = 'Action & Adventure';
                    else if (genreName.includes('Comedy'))
                      mappedGenre = 'Comedy';
                    else if (genreName.includes('Drama'))
                      mappedGenre = 'Drama';
                    else if (genreName.includes('Horror') || genreName.includes('Thriller'))
                      mappedGenre = 'Thriller & Horror';
                    else if (genreName.includes('Romance'))
                      mappedGenre = 'Romance';
                    else if (genreName.includes('Children') || genreName.includes('Family') || genreName.includes('Kids'))
                      mappedGenre = 'Family & Kids';
                    else if (genreName.includes('Documentary') || genreName.includes('Reality'))
                      mappedGenre = 'Documentary & Reality';
                    else if (genreName.includes('Fantasy') || genreName.includes('Sci-Fi'))
                      mappedGenre = 'Fantasy & Sci-Fi';
                    else if (genreName.includes('Music') || genreName.includes('Spiritual'))
                      mappedGenre = 'Spiritual & Musical';
                    else if (genreName.includes('International') || genreName.includes('Language'))
                      mappedGenre = 'International & Language';
                    
                    genreCounts[mappedGenre] = (genreCounts[mappedGenre] || 0) + 1;
                  });
                } else {
                  // Fallback to the boolean genre fields
                  const genreMap = {
                    'Action & Adventure': movie.action || movie.adventure || movie.tvAction,
                    'Comedy': movie.comedies || movie.comediesDramasInternationalMovies || movie.comediesRomanticMovies,
                    'Drama': movie.dramas || movie.dramasRomanticMovies || movie.tvdRamas,
                    'Thriller & Horror': movie.horrorMovies || movie.internationalMoviesThrillers,
                    'Romance': movie.comediesRomanticMovies || movie.dramasRomanticMovies,
                    'Family & Kids': movie.children || movie.kidsTV || movie.familyMovies,
                    'Documentary & Reality': movie.docuseries || movie.documentaries || movie.realityTV,
                    'Fantasy & Sci-Fi': movie.fantasy,
                    'Spiritual & Musical': movie.musicals || movie.spirituality,
                    'International & Language': movie.internationalTVShowsRomanticTVDramas || movie.languageTVShows
                  };
        
                  for (const [genreName, match] of Object.entries(genreMap)) {
                    if (match) genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
                  }
                }
              });
      
              console.log("Genre counts:", genreCounts);
              const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
              console.log("Sorted genres:", sortedGenres);
              
              genre = sortedGenres[0]?.[0] || 'Drama'; // Default to Drama if nothing found
              console.log("Selected favorite genre:", genre);
              setFavoriteGenre(genre);
            } else {
              console.error("Failed to fetch movie genres:", await genreRes.text());
              setFavoriteGenre('Drama'); // Default fallback
            }
          } catch (error) {
            console.error("Error in genre calculation:", error);
            setFavoriteGenre('Drama'); // Default fallback on error
          }
    
          // 5. Set profile title
          let title = 'Movie Enthusiast';
          if (avgRating !== 'N/A') {
            const avg = parseFloat(avgRating);
            if (avg < 2.5) title = 'Tough Critic';
            else if (avg >= 4.5) title = 'Five-Star Fanatic';
          }
    
          if (favoriteGenre === 'Romance') title = 'Hopeless Romantic';
          if (favoriteGenre === 'Fantasy & Sci-Fi') title = 'Sci-Fi Strategist';
    
          setProfileTitle(title);
        }
    
        // 6. Fetch watchlist
        const watchlistRes = await fetch(
          `https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/moviewatchlist/${encodeURIComponent(user.email)}`,
          { credentials: 'include' }
        );
        if (watchlistRes.ok) setWatchlist(await watchlistRes.json());
      };
    
      fetchData();
    }, [user]);
    
    

  return (
    

  <div>

    <Header/>
    <ViewingBadge totalWatched={ratings.length} />
    <ProfileStats
  totalWatched={ratings.length}
  favoriteGenre={favoriteGenre}
  averageRating={averageRating}
  timeWatchedHours={timeWatchedHours}
  profileTitle={profileTitle}
/>

    <div className="profile-container">
      <h1 className="profile-header">Your Ratings</h1>
      <div className="ratings-grid">
        {ratings.map((r, i) => (
          <RatingCard
          key={i}
          rating={r}
          onClick={() => {
            setSelectedMovie(r);
            setUserRating(r.rating); // preload the existing rating
            setShowOverlay(true);
          }}
        />
        
        ))}
      </div>

      <h1 className="profile-header">Your Watchlist</h1>
      <div className="ratings-grid">
        {watchlist.map((movie, i) => (
          <RatingCard
            key={i}
            rating={{ ...movie, rating: 0 }}
            onClick={() => {
              setSelectedMovie(movie);
              setUserRating(null); // reset for unrated watchlist items
              setShowOverlay(true);
            }}
            
          />
        ))}
      </div>

      {showOverlay && selectedMovie && (() => {
  const normalizedMovie = {
    showId: selectedMovie.showId,
    title: selectedMovie.title,
    rating: typeof selectedMovie.rating === 'string' ? selectedMovie.rating : 'NR',
    description: 'description' in selectedMovie ? selectedMovie.description ?? '' : '',
  };

  return (
    <MovieOverlay
      movie={normalizedMovie}
      onClose={() => setShowOverlay(false)}
      initialRating={userRating}
      setMovie={(newMovie) => {
        // Update the selected movie when a recommendation is clicked
        setSelectedMovie({
          showId: newMovie.showId,
          title: newMovie.title,
          rating: newMovie.rating,
          description: newMovie.description
        });
        // Reset user rating for the new movie
        setUserRating(null);
      }}
    />
  );
})()}


    </div>
    </div>
  );
};

export default Profile;
