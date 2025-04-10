import React, { useState, useEffect, useContext } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { UserContext } from './AuthorizeView';
import fallbackImage from '../assets/Fallback.png';
import './MovieCarousel.css';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN = 'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-15T09:35:14Z&st=2025-04-09T01:35:14Z&spr=https,http&sig=N%2FAK8dhBBarxwU9qBSd0aI0B5iEOqmpnKUJ6Ek1yv0k%3D';
const CONTAINER_NAME = 'movieposters';

const getPosterImageUrl = (movieTitle: string): string => {
  const blobPath = `${encodeURIComponent(movieTitle)}.jpg`;
  return `${BLOB_STORAGE_URL}/${CONTAINER_NAME}/${blobPath}?${BLOB_SAS_TOKEN}`;
};

type Movie = {
  showId: string;
  title: string;
  rating: string;
  description: string;
  director?: string;
  cast?: string;
  releaseYear?: number;
  duration?: string;
  country?: string;
  type?: string;
  averageRating?: number;
};

type OverlayProps = {
    movie: Movie;
    onClose: () => void;
    initialRating?: number | null;
    setMovie?: (movie: Movie) => void;
  };

const MovieOverlay: React.FC<OverlayProps> = ({ movie, onClose, initialRating, setMovie }) => {
  const user = useContext(UserContext);
  const [userRating, setUserRating] = useState<number | null>(initialRating ?? null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [posterErrors, setPosterErrors] = useState<Record<string, boolean>>({});
  
  // Recommendations slider for similar movies
  const [recommendationsSliderRef, recommendationsInstanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 5, spacing: 16 },
    breakpoints: {
      '(max-width: 1024px)': { slides: { perView: 3, spacing: 12 } },
      '(max-width: 768px)': { slides: { perView: 2, spacing: 10 } },
    },
  });

  const submitRating = () => {
    if (!userRating) {
      alert('Please select a rating first!');
      return;
    }

    fetch('https://localhost:7156/api/movieratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ showId: movie.showId, rating: userRating }),
    })
      .then((response) => {
        if (response.ok) alert(`Your rating of ${userRating}/5 has been submitted!`);
        else alert('Failed to submit rating.');
      })
      .catch((error) => console.error('Rating submit error:', error));
  };

  // Similar movies
  const fetchSimilarMovies = async (movieTitle: string) => {
    setIsLoadingSimilar(true);
    console.log(`Fetching recommendations for movie: "${movieTitle}"`);
    
    try {
      // Step 1: Get recommendations from API or use mock data
      let allRecommendations = await fetchRecommendationsData(movieTitle);
      
      // Step 2: Find the best recommendation match for this movie
      let movieRecommendation = findBestRecommendationMatch(allRecommendations, movieTitle);
      
      if (movieRecommendation) {
        console.log('Found recommendation:', movieRecommendation);
        
        // Step 3: Extract recommendation titles
        const recommendationTitles = [
          movieRecommendation.recommendation1,
          movieRecommendation.recommendation2,
          movieRecommendation.recommendation3,
          movieRecommendation.recommendation4,
          movieRecommendation.recommendation5,
          movieRecommendation.recommendation6,
          movieRecommendation.recommendation7,
          movieRecommendation.recommendation8
        ].filter(Boolean); // Remove any empty recommendations
        
        // Step 4: Get movie details for these titles
        const limitedRecommendations = recommendationTitles.slice(0, 8);
        const foundMovies = await fetchMovieDetailsForTitles(limitedRecommendations);
        
        console.log(`Found ${foundMovies.length} movies from recommendations`);
        setSimilarMovies(foundMovies);
      } else {
        console.log('No recommendation found for movie:', movieTitle);
        setSimilarMovies([]);
      }
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      setSimilarMovies([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };
  
  // Helper function to get recommendation data
  const fetchRecommendationsData = async (movieTitle: string): Promise<any[]> => {
    try {
      const response = await fetch(
        'https://localhost:7156/api/Recommendations/AllRecommendations1',
        {
          credentials: 'include',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch similar movies');
      }

      const recommendations = await response.json();
      console.log('API response received, recommendations count:', recommendations.length);
      return recommendations;
    } catch (apiError) {
      console.error("API connection error:", apiError);
      console.log("Using mock recommendations data instead");
      
      // Provide mock recommendation data when API is not available
      return [
        {
          if_you_liked: movieTitle,
          recommendation1: "The Shawshank Redemption",
          recommendation2: "The Godfather",
          recommendation3: "Pulp Fiction",
          recommendation4: "The Dark Knight",
          recommendation5: "Fight Club",
          recommendation6: "Forrest Gump",
          recommendation7: "Inception",
          recommendation8: "The Matrix"
        }
      ];
    }
  };
  
  // Helper function to find the best recommendation match
  const findBestRecommendationMatch = (recommendations: any[], movieTitle: string): any => {
    // First look for an exact match
    let match = recommendations.find(
      (rec: any) => rec.if_you_liked.toLowerCase().trim() === movieTitle.toLowerCase().trim()
    );
    
    // If not found, try a looser match (title contains)
    if (!match) {
      match = recommendations.find(
        (rec: any) =>
          movieTitle.toLowerCase().includes(rec.if_you_liked.toLowerCase()) ||
          rec.if_you_liked.toLowerCase().includes(movieTitle.toLowerCase())
      );
      
      // If still not found, just use the first recommendation or find partial matches
      if (!match && recommendations.length > 0) {
        console.log("No similar movies found for this title, using random recommendations");
        
        // Look for partial matches in all recommendation titles
        let partialMatches: any[] = [];
        recommendations.forEach((rec: any) => {
          if (rec.if_you_liked.toLowerCase().includes(movieTitle.toLowerCase().split(' ')[0])) {
            partialMatches.push(rec);
          }
        });
        
        // Use a partial match if found, otherwise use the first recommendation
        match = partialMatches.length > 0 ? partialMatches[0] : recommendations[0];
      }
    }
    
    return match;
  };
  
  // Helper function to fetch movie details for recommended titles
  const fetchMovieDetailsForTitles = async (titles: string[]): Promise<Movie[]> => {
    const foundMovies: Movie[] = [];
    
    try {
      // First try to get all movies and match by title
      const allMoviesResponse = await fetch(
        'https://localhost:7156/api/MoviesTitles',
        {
          credentials: 'include',
          signal: AbortSignal.timeout(3000)
        }
      );
      
      if (allMoviesResponse.ok) {
        const allMovies: Movie[] = await allMoviesResponse.json();
        
        // For each recommended title, find the matching movie by title
        for (const recTitle of titles) {
          // Find the movie with a matching title (case-insensitive)
          const matchingMovie = allMovies.find(
            m => m.title.toLowerCase().trim() === recTitle.toLowerCase().trim()
          );
          
          if (matchingMovie) {
            foundMovies.push(matchingMovie);
            // Set poster image error state to false initially
            setPosterErrors((prev) => ({
              ...prev,
              [matchingMovie.showId]: false,
            }));
          } else {
            console.warn(`Could not find movie with title: ${recTitle}`);
          }
        }
      } else {
        throw new Error('Failed to fetch all movies');
      }
    } catch (err) {
      console.error('Error fetching all movies:', err);
      
      // Fallback: Try to get each movie by ID directly if titles don't work
      for (const recTitle of titles) {
        try {
          // As a fallback, try using the title as an ID
          const response = await fetch(
            `https://localhost:7156/api/MoviesTitles/${encodeURIComponent(recTitle)}`,
            {
              credentials: 'include',
              signal: AbortSignal.timeout(2000)
            }
          );
          
          if (response.ok) {
            const movieData = await response.json();
            if (movieData) {
              foundMovies.push(movieData);
              // Set poster image error state to false initially
              setPosterErrors((prev) => ({
                ...prev,
                [movieData.showId]: false,
              }));
            }
          }
        } catch (fetchError) {
          console.error(`Error fetching movie data for ${recTitle}:`, fetchError);
        }
      }
    }
    
    return foundMovies;
  };
  
  // Handler for when a recommended movie is clicked
  const handleRecommendedMovieClick = async (recommendedMovie: Movie) => {
    console.log('Switching to movie:', recommendedMovie.title);
    
    // Reset user interaction states
    setUserRating(null);
    setHoverRating(null);
    
    // If setMovie prop is provided, use it to update the movie in parent component
    if (setMovie) {
      // This updates the movie in the parent component (MovieCarousel)
      setMovie(recommendedMovie);
    }
    
    // Get more details for the selected movie if needed
    try {
      const response = await fetch(
        `https://localhost:7156/api/MoviesTitles/${recommendedMovie.showId}`,
        {
          credentials: 'include',
          signal: AbortSignal.timeout(3000)
        }
      );
      
      if (response.ok) {
        const fullMovieData = await response.json();
        // We might get more complete data from the API than what we have in the carousel
        console.log('Got full movie data:', fullMovieData);
      }
    } catch (err) {
      console.error('Error fetching full movie details:', err);
    }
    
    // Immediately fetch similar movies for the newly selected movie
    fetchSimilarMovies(recommendedMovie.title);
  };

  // Effect to fetch similar movies when movie changes
  useEffect(() => {
    if (movie) {
      fetchSimilarMovies(movie.title);
    }
  }, [movie]);

  return (
    <div className="movie-overlay">
      <div className="overlay-content">
        <button className="close-overlay" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="overlay-poster">
          <img
            src={getPosterImageUrl(movie.title)}
            alt={movie.title}
            onError={(e) => (e.currentTarget.src = fallbackImage)}
          />
        </div>
        <div className="overlay-details">
          <h2>{movie.title}</h2>
          <p>{movie.description}</p>

          <div className="rate-movie-section">
            <h3>Rate this movie</h3>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`rate-star ${(hoverRating || userRating || 0) >= star ? 'active' : ''}`}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                >
                  ★
                </span>
              ))}
              {userRating && <span>Your rating: {userRating}/5</span>}
            </div>
          </div>

          <div className="overlay-actions">
            <button
              className="overlay-button"
              onClick={() => {
                if (!user?.email) {
                  alert('You must be logged in.');
                  return;
                }
                fetch(
                  `https://localhost:7156/api/moviewatchlist/add/${encodeURIComponent(user.email)}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(movie.showId),
                  }
                )
                  .then((res) => {
                    if (res.ok) alert(`✅ Added "${movie.title}" to your watchlist!`);
                    else alert('❌ Failed to add to watchlist.');
                  })
                  .catch((err) => console.error('Watchlist error:', err));
              }}
            >
              Add to Watchlist
            </button>
            <button className="overlay-button" onClick={submitRating}>
              Submit Rating
            </button>
          </div>
        
          {/* Similar Movies Carousel */}
          {similarMovies.length > 0 && (
            <div className="similar-movies-section">
              <h3>Similar Movies You Might Like</h3>
              <div className="carousel-only-wrapper">
                <div className="recommendations-wrapper">
                  <button
                    className="rec-left-arrow"
                    onClick={(e) => {
                      e.stopPropagation();
                      recommendationsInstanceRef.current?.prev();
                    }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  <div className="recommendations-container">
                    <div ref={recommendationsSliderRef} className="keen-slider recommendations-slider">
                      {similarMovies.map((movie) => (
                        <div key={movie.showId} className="keen-slider__slide recommendation-slide">
                          <div className="recommendation-card">
                            <div className="poster-image-container">
                              <img
                                src={posterErrors[movie.showId] ? fallbackImage : getPosterImageUrl(movie.title)}
                                alt={movie.title}
                                className="poster-image"
                                onClick={() => handleRecommendedMovieClick(movie)}
                                onError={() =>
                                  setPosterErrors((prev) => ({
                                    ...prev,
                                    [movie.showId]: true,
                                  }))
                                }
                              />
                            </div>
                            <div className="recommendation-info" onClick={() => handleRecommendedMovieClick(movie)}>
                              <div className="recommendation-title">{movie.title}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    className="rec-right-arrow"
                    onClick={(e) => {
                      e.stopPropagation();
                      recommendationsInstanceRef.current?.next();
                    }}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default MovieOverlay;
