import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import HeaderSearch from '../components/HeaderSearch';
import fallbackImage from '../assets/Fallback.png';
import { MovieTitle } from '../types/MovieTitle';
import '../components/MovieCarousel.css';
import MovieOverlay from '../components/MovieOverlay';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './SearchPage.css';

// Utility functions
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    return new Promise(resolve => {
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
};

const genres = [
  'Action & Adventure',
  'Comedy',
  'Drama',
  'Documentary & Reality',
  'Romance',
  'Thriller & Horror',
  'Family & Kids',
  'International & Language',
  'Spiritual & Musical',
  'Fantasy & Sci-Fi',
];

const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN =
  'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-15T09:35:14Z&st=2025-04-09T01:35:14Z&spr=https,http&sig=N%2FAK8dhBBarxwU9qBSd0aI0B5iEOqmpnKUJ6Ek1yv0k%3D';
const CONTAINER_NAME = 'movieposters';

const getPosterImageUrl = (title: string) => {
  const blobPath = `${encodeURIComponent(title)}.jpg`;
  return `${BLOB_STORAGE_URL}/${CONTAINER_NAME}/${blobPath}?${BLOB_SAS_TOKEN}`;
};
// LazyMovieCard component - Only renders full content when visible in viewport
const LazyMovieCard = memo(({
  movie,
  posterErrors,
  setPosterErrors,
  onMovieClick
}: {
  movie: MovieTitle;
  posterErrors: Record<string, boolean>;
  setPosterErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onMovieClick: (movie: MovieTitle) => void;
}) => {
  // Use intersection observer with larger margins to start loading before fully visible
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>(
    { rootMargin: '300px 0px' },
    false // Don't disconnect after intersection
  );

  // Return placeholder with same dimensions when not visible
  if (!isVisible) {
    return (
      <div
        ref={ref}
        className="movie-card-placeholder"
        style={{
          width: '100%',
          maxWidth: '200px',
          aspectRatio: '2/3',
          background: '#1e1e1e',
          borderRadius: '8px',
        }}
      />
    );
  }

  // Render full content when visible
  return (
    <div
      ref={ref}
      className="movie-card"
      onClick={() => onMovieClick(movie)}
    >
      <div className="movie-poster-container">
        <img
          src={
            posterErrors[movie.showId]
              ? fallbackImage
              : getPosterImageUrl(movie.title)
          }
          alt={movie.title}
          loading="lazy" // Use browser's native lazy loading as well
          onError={() =>
            setPosterErrors((prev) => ({
              ...prev,
              [movie.showId]: true,
            }))
          }
        />
        {posterErrors[movie.showId] && (
          <div className="poster-fallback-title">{movie.title}</div>
        )}
      </div>
      <div className="movie-title-text">{movie.title}</div>
    </div>
  );
});

// LoadMoreTrigger component - uses the intersection observer to trigger loading more content
const LoadMoreTrigger: React.FC<{ onIntersect: () => void, isLoading: boolean }> = ({ onIntersect, isLoading }) => {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>(
    { rootMargin: '200px 0px' },
    false // Don't disconnect after first intersection
  );
  
  useEffect(() => {
    if (isIntersecting && !isLoading) {
      onIntersect();
    }
  }, [isIntersecting, isLoading, onIntersect]);
  
  return (
    <div
      ref={ref}
      className="load-more-trigger"
      style={{
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '24px'
      }}
    >
      {isLoading ? (
        <div className="loading-spinner">
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="text-gray-400">Scroll for more</div>
      )}
    </div>
  );
};

const SearchPage: React.FC = () => {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [movies, setMovies] = useState<MovieTitle[]>([]);
  const [posterErrors, setPosterErrors] = useState<Record<string, boolean>>({});
  const [selectedMovie, setSelectedMovie] = useState<MovieTitle | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [loadedMovieIds, setLoadedMovieIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genreFromUrl = params.get('genre');
    if (genreFromUrl) {
      setGenre(genreFromUrl);
      fetchMovies('', genreFromUrl, '');
    }
  }, []);

  const fetchMovies = useCallback(async (
    type: string,
    genre: string,
    titleFilter: string,
    currentPage = 1,
    append = false
  ) => {
    try {
      setIsLoading(true);
      const PAGE_SIZE = 50;
      
      // console.log(`Fetching movies - Page: ${currentPage}, Size: ${PAGE_SIZE}, Skip: ${(currentPage - 1) * PAGE_SIZE}`);
      
      // Add a timestamp to prevent caching
      const response = await axios.get<{
        movies: MovieTitle[];
        totalCount: number;
      }>(
        'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/MoviesCategories/AllMovies',
        {
          params: {
            type: type || undefined,
            category: genre || undefined,
            titleFilter: titleFilter || undefined,
            pageNum: currentPage,
            pageSize: PAGE_SIZE,
            _t: new Date().getTime(), // Add timestamp to prevent caching
          },
          withCredentials: true,
        }
      );
      
      // console.log(`Response received - Total count: ${response.data.totalCount}, Movies returned: ${response.data.movies.length}`);
      
      // Update total count for tracking pagination progress
      setTotalMoviesCount(response.data.totalCount);
      
      // Filter out any movies we've already loaded (prevent duplicates)
      const newMovies = response.data.movies.filter(
        movie => !loadedMovieIds.has(movie.showId)
      );
      
      // console.log(`Filtered movies: ${newMovies.length} new movies after removing duplicates`);
      
      if (newMovies.length === 0) {
        // console.log('No new movies found, stopping pagination');
        // If we received no new movies, there are no more to load
        setHasMore(false);
        setIsLoading(false);
        return;
      }
      
      // Track the IDs of movies we've loaded to prevent duplicates
      const updatedMovieIds = new Set(loadedMovieIds);
      newMovies.forEach(movie => updatedMovieIds.add(movie.showId));
      setLoadedMovieIds(updatedMovieIds);
      
      if (append) {
        setMovies(prev => [...prev, ...newMovies]);
      } else {
        setMovies(newMovies);
      }
      
      // Check if we've loaded all available movies
      const totalLoaded = (append ? movies.length + newMovies.length : newMovies.length);
      setHasMore(totalLoaded < response.data.totalCount);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setIsLoading(false);
    }
  }, [loadedMovieIds, movies.length]);

  // Memoize functions to prevent unnecessary re-renders
  const loadMoreMovies = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(type, genre, title, nextPage, true);
  }, [isLoading, hasMore, page, type, genre, title, fetchMovies]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(
      (type: string, genre: string, title: string) => {
        setPage(1);
        setHasMore(true);
        setLoadedMovieIds(new Set());
        setTotalMoviesCount(0);
        fetchMovies(type, genre, title, 1, false);
      },
      300 // 300ms delay
    ),
    [fetchMovies]
  );

  const handleSearch = useCallback(() => {
    debouncedSearch(type, genre, title);
  }, [debouncedSearch, type, genre, title]);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <HeaderSearch />

      <div className="p-4 flex gap-4 flex-wrap justify-center">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            // Auto-search while typing with debounce
            if (e.target.value.length > 2 || e.target.value.length === 0) {
              debouncedSearch(type, genre, e.target.value);
            }
          }}
          className="bg-gray-800 text-white p-2 rounded"
        />

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            debouncedSearch(e.target.value, genre, title);
          }}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="Movie">Movie</option>
          <option value="TV Show">TV Show</option>
        </select>

        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            debouncedSearch(type, e.target.value, title);
          }}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          🔍
        </button>
      </div>

      <div className="search-results-container">
        <h2 className="text-lg font-bold mb-4">Search Results {movies.length > 0 && <span className="text-sm text-gray-400">({movies.length} of {totalMoviesCount})</span>}</h2>
        {movies.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          <>
            <div className="search-grid">
              {showOverlay && selectedMovie && (
                <MovieOverlay
                  movie={{
                    showId: selectedMovie.showId,
                    title: selectedMovie.title,
                    rating: selectedMovie.rating ?? 'NR',
                    description: selectedMovie.description ?? '',
                    director: selectedMovie.director,
                    cast: selectedMovie.cast,
                    releaseYear: selectedMovie.releaseYear,
                    duration: selectedMovie.duration,
                    country: selectedMovie.country,
                    type: selectedMovie.type,
                  }}
                  onClose={() => setShowOverlay(false)}
                  initialRating={null}
                />
              )}

              {movies.map((movie) => (
                <LazyMovieCard
                  key={movie.showId}
                  movie={movie}
                  posterErrors={posterErrors}
                  setPosterErrors={setPosterErrors}
                  onMovieClick={(movie) => {
                    setSelectedMovie(movie);
                    setShowOverlay(true);
                  }}
                />
              ))}
            </div>
            
            {/* Intersection Observer Target or End of Results Message */}
            {hasMore ? (
              <LoadMoreTrigger onIntersect={loadMoreMovies} isLoading={isLoading} />
            ) : (
              movies.length > 0 && (
                <div className="end-of-results" style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: '#a3a3a3',
                  borderTop: '1px solid #333',
                  marginTop: '24px'
                }}>
                  {movies.length > 0 ? (
                    <>
                      <p>End of results</p>
                      <p className="text-sm mt-1">Showing all {movies.length} matches</p>
                    </>
                  ) : null}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
