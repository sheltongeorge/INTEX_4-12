import { useEffect, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import './MovieCarousel.css';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import fallbackImage from '../assets/Fallback.png'; // adjust path if needed

const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN =
  'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-15T09:35:14Z&st=2025-04-09T01:35:14Z&spr=https,http&sig=N%2FAK8dhBBarxwU9qBSd0aI0B5iEOqmpnKUJ6Ek1yv0k%3D';
const CONTAINER_NAME = 'movieposters';

// Add this utility function for getting poster URLs
const getPosterImageUrl = (movieTitle: string): string => {
  // Format the blob path - adjust based on your actual folder structure in Azure
  const blobPath = `${encodeURIComponent(movieTitle)}.jpg`;

  return `${BLOB_STORAGE_URL}/${CONTAINER_NAME}/${blobPath}?${BLOB_SAS_TOKEN}`;
};

type Movie = {
  showId: string;
  title: string;
  rating: string; // MPAA rating
  description: string;
  director?: string;
  cast?: string;
  releaseYear?: number;
  duration?: string;
  country?: string;
  type?: string;
  averageRating?: number; // Average user rating (1-5)
};

// Types for MovieRating data from backend
type MovieRatingData = {
  userId: number;
  showId: string;
  rating: number;
};

// Star rating component
const StarRating = ({ rating, count }: { rating?: number; count?: number }) => {
  // Default to 0 if no rating provided
  const starRating = rating || 0;
  // Create an array of 5 stars
  const stars = Array.from({ length: 5 }, (_, i) => {
    // For full and half stars
    if (i < Math.floor(starRating)) return 'full';
    if (i < Math.ceil(starRating) && !Number.isInteger(starRating))
      return 'half';
    return 'empty';
  });

  return (
    <div className="star-rating">
      {stars.map((type, index) => (
        <span key={index} className={`star ${type}`}></span>
      ))}
      {starRating > 0 && (
        <span className="rating-value">
          ({starRating.toFixed(1)})
          {count !== undefined && (
            <span className="rating-count">
              {' '}
              from {count} {count === 1 ? 'rating' : 'ratings'}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export const MovieCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [posterErrors, setPosterErrors] = useState<Record<string, boolean>>({});
  const [movieRatings, setMovieRatings] = useState<
    Map<string, { avg: number; count: number }>
  >(new Map());
  const [userMovieRatings, setUserMovieRatings] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [isLoadingUserRating, setIsLoadingUserRating] = useState(false);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 5, spacing: 16 },
    breakpoints: {
      '(max-width: 1024px)': { slides: { perView: 3, spacing: 12 } },
      '(max-width: 768px)': { slides: { perView: 2, spacing: 10 } },
    },
  });

  // Add this near your other state declarations
  const [similarSliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 4, spacing: 16 },
    breakpoints: {
      '(max-width: 1024px)': { slides: { perView: 3, spacing: 12 } },
      '(max-width: 768px)': { slides: { perView: 2, spacing: 10 } },
    },
  });
  // Add this near your other slider references
  const [recommendationsSliderRef, recommendationsInstanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 4, spacing: 16 },
    breakpoints: {
      '(max-width: 1024px)': { slides: { perView: 3, spacing: 12 } },
      '(max-width: 768px)': { slides: { perView: 2, spacing: 10 } },
    },
  });
  // Fetch movie ratings from backend
  const fetchMovieRatings = async () => {
    try {
      // Use the new averages endpoint that efficiently returns all ratings
      const response = await fetch(
        'https://localhost:7156/api/movieratings/averages',
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      // The response is already a dictionary of showId -> {avg, count}
      const ratingsData = await response.json();
      const ratingMap = new Map<string, { avg: number; count: number }>();

      // Convert the JSON object to a Map
      Object.entries(ratingsData).forEach(([showId, data]) => {
        const typedData = data as { avg: number; count: number };
        ratingMap.set(showId, typedData);
      });

      setMovieRatings(ratingMap);
    } catch (error) {
      console.error('Error fetching movie ratings:', error);
      // Only use mock data if we can't get real data
      if (movies.length > 0) {
        // Create mock ratings for demo purposes if API fails
        const mockRatingsMap = new Map<
          string,
          { avg: number; count: number }
        >();
        movies.forEach((movie) => {
          // Generate a random rating between 2.5 and 5.0
          const randomRating =
            Math.round((2.5 + Math.random() * 2.5) * 10) / 10;
          // Generate a random count between 5 and 200
          const randomCount = Math.floor(5 + Math.random() * 195);
          mockRatingsMap.set(movie.showId, {
            avg: randomRating,
            count: randomCount,
          });
        });
        setMovieRatings(mockRatingsMap);
      }
    } finally {
      setIsLoadingRatings(false);
    }
  };

  // Fetch the current user's ratings
  const fetchUserRatings = async () => {
    try {
      // Add timeout to the fetch request using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        'https://localhost:7156/api/movieratings/user',
        {
          credentials: 'include',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Handle specific HTTP status codes
      if (response.status === 400) {
        console.warn(
          'Server returned 400 Bad Request for user ratings. This may be expected if no user is logged in.'
        );
        return; // Exit silently without showing an error to the user
      }

      if (response.status === 401) {
        // User is not logged in, so we don't show any error
        return;
      }

      if (!response.ok) {
        console.warn(
          `Server responded with status: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const ratings: MovieRatingData[] = await response.json();
      const userRatingsMap = new Map<string, number>();

      ratings.forEach((rating) => {
        userRatingsMap.set(rating.showId, rating.rating);
      });

      setUserMovieRatings(userRatingsMap);
    } catch (error) {
      // More detailed error logging
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Request timeout fetching user ratings');
      } else if (error instanceof TypeError) {
        console.error(
          'Network error fetching user ratings: Possibly CORS issue or server unavailable'
        );
      } else {
        console.error('Error fetching user ratings:', error);
      }
      // Don't update state in case of error - keep existing ratings if any
    }
  };
  
  //similar movies
  const fetchSimilarMovies = async (movieTitle: string) => {
    setIsLoadingSimilar(true);
    console.log(`Fetching recommendations for movie: "${movieTitle}"`);
    try {
      const response = await fetch(
        'https://localhost:7156/api/Recommendations/AllRecommendations1',
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch similar movies');
      }

      const allRecommendations = await response.json();
      console.log(
        'API response received, recommendations count:',
        allRecommendations.length
      );

      // Log all titles in database for debugging
      console.log('Movie database contains:', movies.length, 'movies');
      
      // Normalize movie title for comparison
      const normalizedTitle = movieTitle.toLowerCase().trim();
      
      // First try exact match
      let movieRecommendation = allRecommendations.find(
        (rec: any) =>
          rec.if_you_liked &&
          rec.if_you_liked.toLowerCase().trim() === normalizedTitle
      );
      
      // If not found, try more flexible matching
      if (!movieRecommendation) {
        console.log('No exact match found, trying flexible matching');
        
        // Try without articles (the, a, an)
        const titleNoArticles = normalizedTitle.replace(/^(the|a|an) /, '');
        movieRecommendation = allRecommendations.find(
          (rec: any) =>
            rec.if_you_liked &&
            rec.if_you_liked.toLowerCase().trim().replace(/^(the|a|an) /, '') === titleNoArticles
        );
        
        // If still not found, try contains
        if (!movieRecommendation) {
          console.log('No match without articles, trying partial matching');
          
          // Find the best match by most similar title
          let bestSimilarity = 0;
          
          allRecommendations.forEach((rec: any) => {
            if (!rec.if_you_liked) return;
            
            const recTitle = rec.if_you_liked.toLowerCase().trim();
            
            // Check if one title contains the other
            if (recTitle.includes(normalizedTitle) || normalizedTitle.includes(recTitle)) {
              // Calculate similarity as length of the shorter title divided by the longer one
              const similarity = Math.min(recTitle.length, normalizedTitle.length) / 
                               Math.max(recTitle.length, normalizedTitle.length);
              
              if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                movieRecommendation = rec;
              }
            }
          });
          
          if (movieRecommendation) {
            console.log(`Found partial match: "${movieRecommendation.if_you_liked}" (similarity: ${bestSimilarity.toFixed(2)})`);
          }
        }
      }

      console.log('Found recommendation object:', movieRecommendation);

      if (movieRecommendation) {
        // Extract all recommendation titles with explicit string[] type
        const recommendedTitles: string[] = [];
        for (let i = 1; i <= 12; i++) {
          const recKey = `recommendation${i}`;
          // Check if property exists and is a string with content
          if (
            recKey in movieRecommendation &&
            typeof movieRecommendation[recKey] === 'string' &&
            movieRecommendation[recKey].trim() !== ''
          ) {
            recommendedTitles.push(movieRecommendation[recKey]);
          }
        }

        console.log('Recommended titles found:', recommendedTitles);

        // Create a normalized map for better title matching
        const movieMap = new Map<string, Movie>();
        
        // Add each movie to the map with different normalized versions of the title
        movies.forEach((movie) => {
          if (!movie.title) return;
          
          const title = movie.title.toLowerCase().trim();
          
          // Original title
          movieMap.set(title, movie);
          
          // Title without articles
          const noArticles = title.replace(/^(the|a|an) /, '');
          if (noArticles !== title) {
            movieMap.set(noArticles, movie);
          }
          
          // Title without punctuation
          const noPunct = title.replace(/[^\w\s]/g, '').trim();
          if (noPunct !== title) {
            movieMap.set(noPunct, movie);
          }
        });
        
        // Match recommendations to movies in our database
        const recommendedMovies: Movie[] = [];
        const matchedIds = new Set<string>(); // Avoid duplicates
        
        recommendedTitles.forEach((title) => {
          // Skip empty titles
          if (!title || title.trim() === '') return;
          
          // Normalize the title for matching
          const normalizedTitle = title.toLowerCase().trim();
          
          // Try direct lookup with normalized variants
          let match = movieMap.get(normalizedTitle);
          
          // Try without articles if no match
          if (!match) {
            const noArticles = normalizedTitle.replace(/^(the|a|an) /, '');
            match = movieMap.get(noArticles);
          }
          
          // Try without punctuation if still no match
          if (!match) {
            const noPunct = normalizedTitle.replace(/[^\w\s]/g, '').trim();
            match = movieMap.get(noPunct);
          }
          
          // If still no match, try to find the movie with most word overlap
          if (!match) {
            const words = normalizedTitle.split(/\s+/);
            // Start with no best match
            let bestScore = 0;
            
            // Find the movie with the most word matches
            for (const movie of movies) {
              if (!movie.title) continue;
              
              const movieWords = movie.title.toLowerCase().split(/\s+/);
              let score = 0;
              
              // Count matching words
              for (const word of words) {
                if (word.length > 2 && movieWords.includes(word)) {
                  score++;
                }
              }
              
              // Also check if one title contains the other
              if (normalizedTitle.includes(movie.title.toLowerCase()) ||
                  movie.title.toLowerCase().includes(normalizedTitle)) {
                score += 2;
              }
              
              // If this movie has a better score than our previous best
              if (score > bestScore) {
                bestScore = score;
                match = movie; // Set as our match directly
              }
            }
            
            // Log the match if found through fuzzy matching
            if (bestScore > 0 && match) {
              console.log(`Found fuzzy match for "${title}": ${match.title} (score: ${bestScore})`);
            }
          }
          
          // Add the match if found and not already added
          if (match && !matchedIds.has(match.showId)) {
            recommendedMovies.push(match);
            matchedIds.add(match.showId);
            console.log(`Added recommendation: ${match.title}`);
          }
        });
        
        console.log(`Found ${recommendedMovies.length} matching movies for recommendations`);

        // Reset poster errors for all recommended movies
        const resetErrorsObj: Record<string, boolean> = {};
        recommendedMovies.forEach((movie) => {
          resetErrorsObj[movie.showId] = false;
        });
        
        // Update the posterErrors state with all reset values at once
        setPosterErrors((prev) => ({
          ...prev,
          ...resetErrorsObj
        }));

        // Only use fallback if no recommended movies were found
        if (recommendedMovies.length === 0) {
          console.warn('No recommended movies found, using fallback random movies');
          
          // Use random movies as fallback, excluding the current movie
          const availableMovies = movies.filter(m => m.showId !== selectedMovie?.showId);
          const shuffled = availableMovies.sort(() => 0.5 - Math.random());
          const randomMovies = shuffled.slice(0, 8);
          
          // Also reset poster errors for random movies
          const randomErrorsReset: Record<string, boolean> = {};
          randomMovies.forEach(movie => {
            randomErrorsReset[movie.showId] = false;
          });
          
          setPosterErrors(prev => ({
            ...prev,
            ...randomErrorsReset
          }));
          
          // Use these instead
          setSimilarMovies(randomMovies);
        } else {
          // Use the matched recommendations
          setSimilarMovies(recommendedMovies);
        }

        // Force update the slider after a short delay
        setTimeout(() => {
          if (recommendationsInstanceRef.current) {
            console.log('Updating recommendations slider');
            recommendationsInstanceRef.current.update();
          }
        }, 100);
      } else {
        console.log(`No recommendation object found for "${movieTitle}"`);
        
        // Fallback for when no recommendation object is found
        const availableMovies = movies.filter(m => m.showId !== selectedMovie?.showId);
        const shuffled = availableMovies.sort(() => 0.5 - Math.random());
        const randomMovies = shuffled.slice(0, 8);
        
        // Reset poster errors for fallback movies
        const resetErrorsObj: Record<string, boolean> = {};
        randomMovies.forEach(movie => {
          resetErrorsObj[movie.showId] = false;
        });
        
        setPosterErrors(prev => ({
          ...prev,
          ...resetErrorsObj
        }));
        
        setSimilarMovies(randomMovies);
        
        setTimeout(() => {
          if (recommendationsInstanceRef.current) {
            console.log('Updating recommendations slider with random movies');
            recommendationsInstanceRef.current.update();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      setSimilarMovies([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Fetch a single user rating for a specific movie
  const fetchUserRatingForMovie = async (showId: string) => {
    setIsLoadingUserRating(true);
    try {
      // Add timeout to the fetch request using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://localhost:7156/api/movieratings/user/${showId}`,
        {
          credentials: 'include',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (response.status === 400) {
        console.warn(
          `Server returned 400 Bad Request for movie rating: ${showId}. This may be expected if no user is logged in or ID is invalid.`
        );
        setUserRating(null);
        return;
      }

      if (response.status === 401) {
        // User is not logged in, handle silently
        setUserRating(null);
        return;
      }

      if (response.status === 404) {
        // User hasn't rated this movie yet, handle silently
        setUserRating(null);
        return;
      }

      if (!response.ok) {
        console.warn(
          `Server responded with status: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const rating: MovieRatingData = await response.json();
      setUserRating(rating.rating);
    } catch (error) {
      // More detailed error logging
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`Request timeout fetching rating for movie ${showId}`);
      } else if (error instanceof TypeError) {
        console.error(
          `Network error fetching rating for movie ${showId}: Possibly CORS issue or server unavailable`
        );
      } else {
        console.error(`Error fetching user rating for movie ${showId}:`, error);
      }

      // Always set rating to null when there's an error
      setUserRating(null);
    } finally {
      setIsLoadingUserRating(false);
    }
  };

  const handleMovieClick = async (movie: Movie) => {
    setSelectedMovie(movie);
    setShowOverlay(true);
    
    // Reset similar movies to empty array when loading a new movie
    setSimilarMovies([]);
    
    await fetchSimilarMovies(movie.title); // Pass title instead of ID

    // Check if the user has previously rated this movie
    if (userMovieRatings.has(movie.showId)) {
      setUserRating(userMovieRatings.get(movie.showId) || null);
    } else {
      // If not in our local cache, fetch from the server
      fetchUserRatingForMovie(movie.showId);
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
  };

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update(); // Recalculate dimensions
    }
  }, []);

  const [isSliderReady, setIsSliderReady] = useState(false);

  useEffect(() => {
    // Fetch movies
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          'https://localhost:7156/api/moviestitles',
          {
            credentials: 'include',
          }
        );
        const data = await response.json();
        setMovies(data.slice(0, 30));
        setIsLoadingRatings(true);

        // Force KeenSlider to recalculate dimensions after movies are set
        if (instanceRef.current) {
          instanceRef.current.update();
        }

        // Mark the slider as ready
        setIsSliderReady(true);
      } catch (err) {
        console.error('Error loading movies:', err);
      }
    };

    fetchMovies();
  }, []);

  // Fetch ratings after movies are loaded
  useEffect(() => {
    if (movies.length > 0 && isLoadingRatings) {
      fetchMovieRatings();
      fetchUserRatings(); // Also fetch user's own ratings
    }
  }, [movies, isLoadingRatings]);

  // Add this effect to update the recommendations slider when similar movies change
  useEffect(() => {
    if (recommendationsInstanceRef.current && similarMovies.length > 0) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        recommendationsInstanceRef.current?.update();
        console.log("Recommendations slider updated with", similarMovies.length, "movies");
      }, 100);
    }
  }, [similarMovies, recommendationsInstanceRef]);

  return (
    <div className="carousel-container">
      <div
        className={`carousel-wrapper ${showOverlay ? 'overlay-active' : ''}`}
      >
        {isSliderReady ? (
          <div ref={sliderRef} className="keen-slider">
            {movies.map((movie) => (
              <div key={movie.showId} className="keen-slider__slide slide">
                <div
                  className="poster-card"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="poster-image-container">
                    {posterErrors[movie.showId] ? (
                      <div className="fallback-wrapper">
                        {fallbackImage && (
                          <img
                            src={fallbackImage}
                            alt="Fallback"
                            className="poster-image"
                          />
                        )}
                        <div className="fallback-overlay-title">
                          {movie.title}
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getPosterImageUrl(movie.title)}
                        alt={movie.title}
                        className="poster-image"
                        onError={() =>
                          setPosterErrors((prev) => ({
                            ...prev,
                            [movie.showId]: true,
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="hover-info">
                    <h3 className="poster-title">{movie.title}</h3>
                    <p className="poster-rating">Rating: {movie.rating}</p>
                    <div className="action-buttons">
                      <button
                        className="circular-button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="button-icon plus-icon"></span>
                        <span className="button-tooltip">Add to Watchlist</span>
                      </button>
                      <button
                        className="circular-button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="button-icon more-icon"></span>
                        <span className="button-tooltip">More Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="loading-placeholder">Loading...</div>
        )}
        <button
          className="arrow left-arrow"
          onClick={() => instanceRef.current?.prev()}
        >
          <ArrowLeft size={20} />
        </button>
        <button
          className="arrow right-arrow"
          onClick={() => instanceRef.current?.next()}
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Keep the overlay outside the blurred area */}
      {showOverlay && selectedMovie && (
        <div className="movie-overlay">
          <div className="overlay-content">
            <button className="close-overlay" onClick={closeOverlay}>
              <X size={24} />
            </button>
            <div className="overlay-poster">
              <div className="poster-image-container">
                <img
                  src={getPosterImageUrl(selectedMovie.title)}
                  alt={selectedMovie.title}
                  className="poster-image"
                  onError={(e) => {
                    console.error(
                      `Overlay image not found for: ${selectedMovie.title}`
                    );
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = fallbackImage; // Local fallback

                    // Add overlay title when fallback image is used
                    const container = e.currentTarget.parentElement;
                    if (container) {
                      const overlay = document.createElement('div');
                      overlay.className = 'fallback-overlay-title';
                      overlay.textContent = selectedMovie.title;
                      container.appendChild(overlay);
                    }
                  }}
                />
              </div>
            </div>
            <div className="overlay-details">
              <h2 className="overlay-title">{selectedMovie.title}</h2>
              <div className="overlay-metadata">
                {selectedMovie.releaseYear && (
                  <span className="metadata-item">
                    {selectedMovie.releaseYear}
                  </span>
                )}
                {selectedMovie.duration && (
                  <span className="metadata-item">
                    {selectedMovie.duration}
                  </span>
                )}
                {selectedMovie.rating && (
                  <span className="metadata-item mpaa-rating">
                    {selectedMovie.rating}
                  </span>
                )}
                {selectedMovie.type && (
                  <span className="metadata-item">{selectedMovie.type}</span>
                )}
              </div>
              {/* User ratings */}
              <div className="user-rating-container">
                {selectedMovie && movieRatings.has(selectedMovie.showId) ? (
                  <StarRating
                    rating={movieRatings.get(selectedMovie.showId)?.avg}
                    count={movieRatings.get(selectedMovie.showId)?.count}
                  />
                ) : (
                  <div className="no-ratings">No ratings yet</div>
                )}
              </div>
              {selectedMovie.description && (
                <p className="overlay-description">
                  {selectedMovie.description}
                </p>
              )}
              {selectedMovie.director && (
                <div className="overlay-info-section">
                  <h3 className="info-title">Director</h3>
                  <p>{selectedMovie.director}</p>
                </div>
              )}
              {selectedMovie.cast && (
                <div className="overlay-info-section">
                  <h3 className="info-title">Cast</h3>
                  <p>{selectedMovie.cast}</p>
                </div>
              )}
              {selectedMovie.country && (
                <div className="overlay-info-section">
                  <h3 className="info-title">Country</h3>
                  <p>{selectedMovie.country}</p>
                </div>
              )}{' '}
              {/*literally just testing stuff*/}
              {/* User rating input */}
              <div className="rate-movie-section">
                <h3 className="info-title">Rate this movie</h3>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`rate-star ${
                        (hoverRating || userRating || 0) >= star ? 'active' : ''
                      }`}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                    >
                      ★
                    </span>
                  ))}
                  {userRating && (
                    <span className="user-rating-text">
                      Your rating: {userRating}/5
                    </span>
                  )}
                </div>
              </div>
              <div className="overlay-actions">
                <button className="overlay-button">Add to Watchlist</button>
                <button
                  className="overlay-button"
                  onClick={() => {
                    if (userRating && selectedMovie) {
                      // Submit the rating to our real backend API
                      fetch('https://localhost:7156/api/movieratings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                          showId: selectedMovie.showId,
                          rating: userRating,
                        }),
                      })
                        .then((response) => {
                          if (response.ok) {
                            alert(
                              `Your rating of ${userRating}/5 has been submitted!`
                            );

                            // After submission, refresh all ratings to get the updated averages
                            fetchMovieRatings();

                            // Update our local cache of user ratings
                            setUserMovieRatings((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(selectedMovie.showId, userRating);
                              return newMap;
                            });
                          } else {
                            // Handle error responses by status code
                            if (response.status === 401) {
                              alert('You must be logged in to rate movies.');
                            } else {
                              alert(
                                'Failed to submit rating. Please try again.'
                              );
                            }
                          }
                        })
                        .catch((error) => {
                          console.error('Error submitting rating:', error);
                          alert('Error submitting rating. Please try again.');
                        });
                    } else {
                      alert('Please select a rating first!');
                    }
                  }}
                >
                  Submit Rating
                </button>
              </div>
            </div>
            {/* Add this right before the closing overlay-content div */}
            {/* Recommended Movies Carousel */}
            <div className="recommended-movies-section">
              <h3 className="info-title">Recommended Movies</h3>
              {isLoadingSimilar ? (
                <div className="loading">Loading recommendations...</div>
              ) : similarMovies.length > 0 ? (
                <div className="recommendations-wrapper">
                  <button
                    className="arrow rec-left-arrow"
                    onClick={() => recommendationsInstanceRef.current?.prev()}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="recommendations-container">
                    <div
                      ref={recommendationsSliderRef}
                      className="keen-slider recommendations-slider"
                    >
                      {similarMovies.map((movie) => (
                        <div
                          key={movie.showId}
                          className="keen-slider__slide recommendation-slide"
                        >
                          <div
                            className="poster-card recommendation-card"
                            onClick={() => handleMovieClick(movie)}
                          >
                            <div className="poster-image-container">
                              {posterErrors[movie.showId] ? (
                                <div className="fallback-wrapper">
                                  <img
                                    src={fallbackImage}
                                    alt={`Fallback for ${movie.title}`}
                                    className="poster-image"
                                  />
                                  <div className="fallback-overlay-title">
                                    {movie.title}
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={getPosterImageUrl(movie.title)}
                                  alt={movie.title}
                                  className="poster-image"
                                  onLoad={() => console.log(`Poster loaded for ${movie.title}`)}
                                  onError={(e) => {
                                    console.error(`Error loading poster for ${movie.title}`);
                                    // Try one more time with a cache-busting URL
                                    const img = e.currentTarget;
                                    if (!img.src.includes('&cachebust=')) {
                                      console.log(`Retrying poster load for ${movie.title} with cache busting`);
                                      img.src = `${getPosterImageUrl(movie.title)}&cachebust=${Date.now()}`;
                                    } else {
                                      // If already tried with cache busting, mark as error
                                      setPosterErrors((prev) => ({
                                        ...prev,
                                        [movie.showId]: true,
                                      }));
                                    }
                                  }}
                                />
                              )}
                            </div>
                            <div className="recommendation-info">
                              <h3 className="recommendation-title">
                                {movie.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="arrow rec-right-arrow"
                    onClick={() => recommendationsInstanceRef.current?.next()}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="no-recommendations">
                  No recommended movies found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
