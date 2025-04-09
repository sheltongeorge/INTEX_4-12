import { useEffect, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import './MovieCarousel.css';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
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
  const [movieRatings, setMovieRatings] = useState<
    Map<string, { avg: number; count: number }>
  >(new Map());
  const [userMovieRatings, setUserMovieRatings] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 5, spacing: 16 },
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
        'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/movieratings/averages',
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
      const response = await fetch(
        'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/movieratings/user',
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        // If unauthorized, the user is not logged in, so we don't show any error
        if (response.status === 401) {
          return;
        }
        throw new Error('Failed to fetch user ratings');
      }

      const ratings: MovieRatingData[] = await response.json();
      const userRatingsMap = new Map<string, number>();

      ratings.forEach((rating) => {
        userRatingsMap.set(rating.showId, rating.rating);
      });

      setUserMovieRatings(userRatingsMap);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  // Fetch a single user rating for a specific movie
  const fetchUserRatingForMovie = async (showId: string) => {
    try {
      const response = await fetch(
        `https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/movieratings/user/${showId}`,
        {
          credentials: 'include',
        }
      );

      if (response.status === 401) {
        // User is not logged in, ignore
        return;
      }

      if (response.status === 404) {
        // User hasn't rated this movie yet
        setUserRating(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user rating');
      }

      const rating: MovieRatingData = await response.json();
      setUserRating(rating.rating);
    } catch (error) {
      console.error(`Error fetching user rating for movie ${showId}:`, error);
      setUserRating(null);
    } finally {
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowOverlay(true);

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
    // Fetch movies
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/MoviesTitles/AllMovies',
          {
            credentials: 'include',
          }
        );
        const data = await response.json();
        setMovies(data.slice(0, 30));
        setIsLoadingRatings(true);
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
  return (
    <div className="carousel-container">
      <div
        className={`carousel-wrapper ${showOverlay ? 'overlay-active' : ''}`}
      >
        <div ref={sliderRef} className="keen-slider">
          {movies.map((movie) => (
            <div key={movie.showId} className="keen-slider__slide slide">
              <div
                className="poster-card"
                onClick={() => handleMovieClick(movie)}
              >
                <div className="poster-image-container">
                  <img
                    src={`https://localhost:7156/MoviePosters/Movie%20Posters/${encodeURIComponent(
                      movie.title
                    )}.jpg`}
                    alt={movie.title}
                    className="poster-image"
                    onError={(e) => {
                      console.error(`Failed to load image for: ${movie.title}`);
                      // Try without the space encoding as a fallback
                      e.currentTarget.src = `https://localhost:7156/MoviePosters/Movie Posters/${encodeURIComponent(
                        movie.title
                      )}.jpg`;

                      // Add a second error handler for the fallback
                      e.currentTarget.onerror = () => {
                        console.error(
                          `Fallback also failed for: ${movie.title}`
                        );
                        e.currentTarget.src =
                          'https://via.placeholder.com/225x338?text=No+Image';
                        e.currentTarget.onerror = null; // Prevent infinite loops
                      };
                    }}
                  />
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
              <img
                src={`https://localhost:7156/MoviePosters/Movie%20Posters/${encodeURIComponent(
                  selectedMovie.title
                )}.jpg`}
                alt={selectedMovie.title}
                onError={(e) => {
                  console.error(
                    `Failed to load overlay image for: ${selectedMovie.title}`
                  );
                  // Try without the space encoding as a fallback
                  e.currentTarget.src = `https://localhost:7156/MoviePosters/Movie Posters/${encodeURIComponent(
                    selectedMovie.title
                  )}.jpg`;

                  // Add a second error handler for the fallback
                  e.currentTarget.onerror = () => {
                    console.error(
                      `Overlay fallback also failed for: ${selectedMovie.title}`
                    );
                    e.currentTarget.src =
                      'https://via.placeholder.com/300x450?text=No+Image';
                    e.currentTarget.onerror = null; // Prevent infinite loops
                  };
                }}
              />
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
              )}
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
                      fetch(
                        'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/movieratings',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({
                            showId: selectedMovie.showId,
                            rating: userRating,
                          }),
                        }
                      )
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
          </div>
        </div>
      )}
    </div>
  );
};
