import { useEffect, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import './MovieCarousel.css';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import fallbackImage from '../assets/Fallback.png'; // adjust path if needed
import { useContext } from 'react';
import { UserContext } from './AuthorizeView'; // path might need to adjust


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

// Type definition for Movie
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
  recommendationPosition?: number; // Position in recommendation list
};

// Type for Recommendation2Data data from backend
type Recommendation2Data = {
  id: number;
  user_id: number;
  category: string;
  position: number;
  show_id: string;
  title: string;
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

export interface MovieCarouselProps {
  categoryTitle?: string;
  categoryType?: string;
}

export const MovieCarousel = ({ categoryTitle, categoryType }: MovieCarouselProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [posterErrors, setPosterErrors] = useState<Record<string, boolean>>({});
  const user = useContext(UserContext);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isSliderReady, setIsSliderReady] = useState(false);
  
  const [movieRatings, setMovieRatings] = useState<
    Map<string, { avg: number; count: number }>
  >(new Map());
  const [userMovieRatings, setUserMovieRatings] = useState<Map<string, number>>(
    new Map()
  );
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [isLoadingUserRating, setIsLoadingUserRating] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [recommendationCategories, setRecommendationCategories] = useState<Record<string, Movie[]>>({});
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Main carousel slider
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 6, spacing: 10 },
    drag: true,
    rubberband: true,
    breakpoints: {
      '(max-width: 1024px)': { slides: { perView: 3, spacing: 12 } },
      '(max-width: 768px)': { slides: { perView: 2, spacing: 10 } },
    },
  });
  
  // Recommendations slider for similar movies
  const [recommendationsSliderRef, recommendationsInstanceRef] = useKeenSlider<HTMLDivElement>({
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
    // Create controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
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

  // Fetch recommendations from AllRecommendations2 and organize them by category
  const fetchRecommendationCategories = async () => {
    setIsLoadingRecommendations(true);
    try {
      // First get the user's ID from the auth endpoint
      let userIdForRecommendations = null;
      
      try {
        const userResponse = await fetch('https://localhost:7156/pingauth', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData && userData.id) {
            userIdForRecommendations = userData.id;
            setUserId(userData.id);
          }
        }
      } catch (userError) {
        console.error('Error fetching user data:', userError);
      }
      
      // Use user ID for recommendations if available
      const recommendationsUrl = userIdForRecommendations
        ? `https://localhost:7156/api/Recommendations/UserRecommendations/${userIdForRecommendations}`
        : 'https://localhost:7156/api/Recommendations/AllRecommendations2';
      
      // Fetch recommendations with the user ID if available
      const response = await fetch(
        recommendationsUrl,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const recommendationsData: Recommendation2Data[] = await response.json();
      console.log('AllRecommendations2 data:', recommendationsData);
      
      // Group recommendations by category
      let recommendationsByCategory: Record<string, Recommendation2Data[]> = {};
      
      recommendationsData.forEach(rec => {
        const category = rec.category;
        if (!recommendationsByCategory[category]) {
          recommendationsByCategory[category] = [];
        }
        recommendationsByCategory[category].push(rec);
      });
      
      console.log('Recommendations by category:', recommendationsByCategory);
      
      // If we have a specific categoryType passed as a prop, only use that category
      if (categoryType && categoryType === 'personal' && recommendationsByCategory['Top Picks for You']) {
        // For the "personal" category type, we specifically want "Top Picks for You"
        const topPicksOnly: Record<string, Recommendation2Data[]> = {
          'Top Picks for You': recommendationsByCategory['Top Picks for You']
        };
        recommendationsByCategory = topPicksOnly;
        console.log('Using only Top Picks category for personal recommendations');
      }
      
      // Fetch complete movie data for each recommendation
      const categorizedMovies: Record<string, Movie[]> = {};
      
      for (const [category, recommendations] of Object.entries(recommendationsByCategory)) {
        const moviesInCategory: Movie[] = [];
        
        // Sort by position (lower position values should appear first)
        recommendations.sort((a, b) => a.position - b.position);
        
        console.log(`Sorted ${category} recommendations by position:`,
          recommendations.map(r => `${r.title} (pos: ${r.position}, ID: ${r.show_id})`));
        // For the "personal" type carousel, make sure to process all movies in the "Top Picks for You" category
        // Don't limit the recommendations for the primary carousel
        const recommendationsToProcess = categoryType === 'personal'
          ? recommendations  // Use all recommendations for Top Picks
          : recommendations.slice(0, 10); // Limit for other categories
          
        console.log(`Processing ${recommendationsToProcess.length} recommendations for ${category}`);
        console.log('Recommendation positions:', recommendationsToProcess.map(r =>
          `ID: ${r.show_id}, Position: ${r.position}, Title: ${r.title}`).join('\n'));
        
        // Keep track of unique show_ids to prevent duplicates
        const processedShowIds = new Set<string>();
        
        
        // Create a safer fetch function with timeout
        const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 5000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        };
        
        // Process in sequence rather than all in parallel to reduce server load
        const moviesWithPosition: Movie[] = [];
        
        for (const rec of recommendationsToProcess) {
          // Skip if we've already processed this show_id (avoid duplicates)
          if (processedShowIds.has(rec.show_id)) {
            console.log(`Skipping duplicate show_id: ${rec.show_id}`);
            continue;
          }
          
          // Mark this show_id as processed
          processedShowIds.add(rec.show_id);
          
          try {
            // Fetch with a timeout to prevent hanging
            const movieResponse = await fetchWithTimeout(
              `https://localhost:7156/api/MoviesTitles/${rec.show_id}`,
              { credentials: 'include' },
              5000 // 5 second timeout
            );
            
            if (movieResponse.ok) {
              const movieData: Movie = await movieResponse.json();
              // Add position info and add to array
              moviesWithPosition.push({
                ...movieData,
                recommendationPosition: rec.position
              });
            } else {
              console.warn(`Movie with ID ${rec.show_id} not found`);
            }
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              console.warn(`Request timed out for movie ID ${rec.show_id}`);
            } else {
              console.error(`Error fetching movie ${rec.show_id}:`, error);
            }
          }
        }
        
        // Log how many movies were successfully fetched
        console.log(`Successfully fetched ${moviesWithPosition.length} movies for ${category}`);
        if (moviesWithPosition.length > 0) {
          // Log the movies we fetched to help debug
          console.log('Movie titles:', moviesWithPosition.map(m => m.title).join(', '));
          
          // Ensure they're still sorted by recommendation position
          moviesWithPosition.sort((a, b) =>
            (a.recommendationPosition || 999) - (b.recommendationPosition || 999)
          );
          
          // Log the sorted order
          console.log('Sorted movie order:', moviesWithPosition.map(m =>
            `${m.title} (pos: ${m.recommendationPosition})`).join(', '));
            
          categorizedMovies[category] = moviesWithPosition;
        } else {
          console.warn(`No movies found for category ${category} - check if API is returning data`);
        }
      }
      
      console.log('Categorized movies for carousel:', categorizedMovies);
      setRecommendationCategories(categorizedMovies);
      
    } catch (error) {
      console.error('Error fetching recommendation categories:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  // Similar movies
  const fetchSimilarMovies = async (movieTitle: string) => {
    setIsLoadingSimilar(true);
    console.log(`Fetching recommendations for movie: "${movieTitle}"`);
    try {
      // First try to get all recommendations
      let allRecommendations = [];
      try {
        const response = await fetch(
          'https://localhost:7156/api/Recommendations/AllRecommendations1',
          {
            credentials: 'include',
            // Add a timeout to prevent long waiting times if server is down
            signal: AbortSignal.timeout(3000) // 3 second timeout
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch similar movies');
        }

        allRecommendations = await response.json();
        console.log(
          'API response received, recommendations count:',
          allRecommendations.length
        );
      } catch (apiError) {
        console.error("API connection error:", apiError);
        console.log("Using mock recommendations data instead");
        
        // Provide mock recommendation data when API is not available
        allRecommendations = [
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

        // Use the backend endpoint to find movies by titles
        try {
          // Filter out empty titles
          const validTitles = recommendedTitles.filter(t => t && t.trim() !== '');
          
          if (validTitles.length === 0) {
            console.warn("No valid recommendation titles to search for");
            throw new Error("No valid recommendation titles");
          }
          
          console.log("Sending titles to backend for matching:", validTitles);
          
          // Use the new FindByTitles endpoint we created
          const titlesResponse = await fetch(
            'https://localhost:7156/api/MoviesTitles/FindByTitles',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(validTitles)
            }
          );
          
          if (!titlesResponse.ok) {
            throw new Error(`Server returned ${titlesResponse.status}: ${titlesResponse.statusText}`);
          }
          
          const matchResult = await titlesResponse.json();
          console.log("Backend title matching results:", matchResult);
          
          // Get the matched movies from the backend response
          const foundMovies: Movie[] = matchResult.foundMovies || [];
          const notFoundTitles = matchResult.notFoundTitles || [];
          
          if (notFoundTitles.length > 0) {
            console.warn("Some titles couldn't be matched:", notFoundTitles.join(", "));
          }
          
          if (foundMovies.length === 0) {
            console.warn("No movies matched by the backend, falling back to client-side matching");
            throw new Error("No movies matched by backend");
          }
          
          // Log the matched movies
          console.log(`Backend found ${foundMovies.length} matching movies for recommendations`);
          
          // Reset poster errors for all recommended movies
          const resetErrorsObj: Record<string, boolean> = {};
          foundMovies.forEach((movie) => {
            resetErrorsObj[movie.showId] = false;
            console.log(`Recommended movie from backend: ${movie.title}, ID: ${movie.showId}`);
          });
          
          // Update the posterErrors state with all reset values at once
          setPosterErrors((prev) => ({
            ...prev,
            ...resetErrorsObj
          }));
          
          // Set the similar movies state to display these movies
          setSimilarMovies(foundMovies);
          
        } catch (matchError) {
          console.error("Error matching with backend:", matchError);
          console.log("Falling back to client-side matching");
          
          // Fallback to client-side matching
          const movieMap = new Map<string, Movie>();
          
          // Simple mapping of titles to movies for fallback
          movies.forEach(movie => {
            if (movie.title) {
              movieMap.set(movie.title.toLowerCase().trim(), movie);
            }
          });
          
          // Simple matching algorithm for fallback
          const matchedMovies: Movie[] = [];
          const matchedIds = new Set<string>();
          
          for (const title of recommendedTitles) {
            if (!title || title.trim() === '') continue;
            
            const normalizedTitle = title.toLowerCase().trim();
            
            // Try exact match
            let foundMovie = movieMap.get(normalizedTitle);
            
            // If no exact match, try partial matching
            if (!foundMovie) {
              foundMovie = movies.find(m => 
                m.title && (
                  m.title.toLowerCase().includes(normalizedTitle) || 
                  normalizedTitle.includes(m.title.toLowerCase())
                )
              );
            }
            
            if (foundMovie && !matchedIds.has(foundMovie.showId)) {
              matchedMovies.push(foundMovie);
              matchedIds.add(foundMovie.showId);
              console.log(`Matched movie in fallback: ${foundMovie.title}`);
            }
          }
          
          console.log(`Fallback matching found ${matchedMovies.length} movies`);
          
          // Reset poster errors for matched movies
          const resetErrorsObj: Record<string, boolean> = {};
          matchedMovies.forEach(movie => {
            resetErrorsObj[movie.showId] = false;
          });
          
          setPosterErrors(prev => ({
            ...prev,
            ...resetErrorsObj
          }));
          
          setSimilarMovies(matchedMovies);
        }
        
      } else {
        console.log(`No recommendation object found for "${movieTitle}"`);
        
        // If no recommendations found, just show some random movies as fallback
        const availableMovies = movies.filter(m => m.showId !== selectedMovie?.showId);
        const shuffled = availableMovies.sort(() => 0.5 - Math.random());
        const randomMovies = shuffled.slice(0, 8);
        
        console.log("Using random movies as recommendations fallback");
        
        // Reset poster errors for random movies
        const resetErrorsObj: Record<string, boolean> = {};
        randomMovies.forEach(movie => {
          resetErrorsObj[movie.showId] = false;
        });
        
        setPosterErrors(prev => ({
          ...prev,
          ...resetErrorsObj
        }));
        
        setSimilarMovies(randomMovies);
      }
      
      // Force update the slider after a short delay
      setTimeout(() => {
        if (recommendationsInstanceRef.current) {
          console.log('Updating recommendations slider');
          recommendationsInstanceRef.current.update();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      
      // Final fallback - if everything fails, just show some random movies
      console.log("Using random movies as ultimate fallback");
      const availableMovies = movies.filter(m => m.showId !== selectedMovie?.showId);
      const shuffled = availableMovies.sort(() => 0.5 - Math.random());
      const randomMovies = shuffled.slice(0, 8);
      
      // Reset poster errors for random movies
      const resetErrorsObj: Record<string, boolean> = {};
      randomMovies.forEach(movie => {
        resetErrorsObj[movie.showId] = false;
      });
      
      setPosterErrors(prev => ({
        ...prev,
        ...resetErrorsObj
      }));
      
      setSimilarMovies(randomMovies);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Fetch a single user rating for a specific movie
  const fetchUserRatingForMovie = async (showId: string) => {
    setIsLoadingUserRating(true);
    try {
      const response = await fetch(
        `https://localhost:7156/api/movieratings/user/${showId}`,
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
      setIsLoadingUserRating(false);
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
    if (instanceRef.current) {
      instanceRef.current.update(); // Recalculate dimensions
    }
  }, []);

  // Add this effect to update the recommendations slider when similar movies change
  useEffect(() => {
    if (recommendationsInstanceRef.current && similarMovies.length > 0) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        recommendationsInstanceRef.current?.update();
        console.log("Recommendations slider updated with", similarMovies.length, "movies");
      }, 100);
    }
  }, [similarMovies]);

  // Always call hooks in the same order - don't conditionally call hooks
  useEffect(() => {
    // Fetch recommendations but only for the personal type carousel
    // This ensures the hook is always called in the same order
    const shouldFetchRecommendations = categoryType === 'personal';
    if (shouldFetchRecommendations) {
      fetchRecommendationCategories();
    }
    
    // Also fetch movies based on category type
    const fetchMovies = async () => {
      try {
        let endpoint = 'https://localhost:7156/api/moviestitles';
        
        // If we have a user ID and category type, use a more specific endpoint
        if (userId && categoryType) {
          switch(categoryType) {
            case 'personal':
              endpoint = `https://localhost:7156/api/MoviesTitles/UserRecommendations/${userId}`;
              break;
            case 'trending':
              endpoint = 'https://localhost:7156/api/MoviesTitles/Trending';
              break;
            case 'similar':
              endpoint = `https://localhost:7156/api/MoviesTitles/UserSimilar/${userId}`;
              break;
            default:
              // Use default endpoint
              break;
          }
        }
        
        console.log(`Fetching movies from ${endpoint} for category: ${categoryTitle || 'default'}`);
        
        const response = await fetch(
          endpoint,
          {
            credentials: 'include',
          }
        );
        const data = await response.json();
        setMovies(Array.isArray(data) ? data.slice(0, 30) : []);
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
  }, [categoryType, userId]);

  // Fetch ratings after movies are loaded
  useEffect(() => {
    if (movies.length > 0 && isLoadingRatings) {
      fetchMovieRatings();
      fetchUserRatings();
    }
  }, [movies, isLoadingRatings]);

  return (
    <div className="carousel-container">
      {/* Render recommendation categories */}
      {isLoadingRecommendations ? (
        <div className="loading-placeholder">Loading recommendations...</div>
      ) : Object.entries(recommendationCategories).length > 0 ? (
        // Map through each category and render a carousel
        Object.entries(recommendationCategories).map(([category, categoryMovies]) => (
          <div key={category} className="category-carousel-container">
            <h2 className="category-title">{category}</h2>
            <div className={`carousel-wrapper ${showOverlay ? 'overlay-active' : ''}`}>
              <div className="keen-slider" ref={sliderRef}>
                {categoryMovies.map((movie) => (
                  <div key={movie.showId} className="keen-slider__slide slide">
                    <div
                      className="poster-card"
                      onClick={() => handleMovieClick(movie)}
                    >
                      <div className="poster-image-container">
                        {posterErrors[movie.showId] ? (
                          <div className="fallback-wrapper">
                            <img
                              src={fallbackImage}
                              alt="Fallback"
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
          </div>
        ))
      ) : (
        // Fallback to regular movies carousel
        <div className={`carousel-wrapper ${showOverlay ? 'overlay-active' : ''}`}>
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
                          <img
                            src={fallbackImage}
                            alt="Fallback"
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
      )}

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
              <button
  className="overlay-button"
  onClick={() => {
    if (!user?.email || !selectedMovie?.showId) {
      alert("You must be logged in to use the watchlist.");
      return;
    }

    fetch(
      `https://localhost:7156/api/moviewatchlist/add/${encodeURIComponent(user.email)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(selectedMovie.showId),
      }
    )
      .then((res) => {
        if (res.ok) {
          alert(`✅ Added "${selectedMovie.title}" to your watchlist!`);
        } else if (res.status === 409) {
          alert(`⚠️ "${selectedMovie.title}" is already in your watchlist.`);
        } else {
          alert('❌ Failed to add to watchlist.');
        }
      })
      .catch((err) => {
        console.error('Watchlist error:', err);
        alert('❌ An error occurred. Please try again.');
      });
  }}
>
  Add to Watchlist
</button>

<button
  className="overlay-button"
  onClick={() => {
    if (!userRating || !selectedMovie) {
      alert('Please select a rating first!');
      return;
    }

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
          alert(`Your rating of ${userRating}/5 has been submitted!`);

          // Refresh average ratings
          fetchMovieRatings();

          // Update local cache of user ratings
          setUserMovieRatings((prev) => {
            const newMap = new Map(prev);
            newMap.set(selectedMovie.showId, userRating);
            return newMap;
          });
        } else if (response.status === 401) {
          alert('You must be logged in to rate movies.');
        } else {
          alert('Failed to submit rating. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error submitting rating:', error);
        alert('Error submitting rating. Please try again.');
      });
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
