import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/header';
import HeaderSearch from '../components/HeaderSearch';
import fallbackImage from '../assets/Fallback.png';
import { MovieTitle } from '../types/MovieTitle';
import '../components/MovieCarousel.css';
import MovieOverlay from '../components/MovieOverlay';
import './SearchPage.css';



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

const SearchPage: React.FC = () => {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [movies, setMovies] = useState<MovieTitle[]>([]);
  const [posterErrors, setPosterErrors] = useState<Record<string, boolean>>({});
  const [selectedMovie, setSelectedMovie] = useState<MovieTitle | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genreFromUrl = params.get('genre');
    if (genreFromUrl) {
      setGenre(genreFromUrl);
      fetchMovies('', genreFromUrl, '');
    }
  }, []);

  const fetchMovies = async (
    type: string,
    genre: string,
    titleFilter: string
  ) => {
    try {
      const response = await axios.get<{
        movies: MovieTitle[];
        totalCount: number;
      }>('https://localhost:7156/api/MoviesCategories/AllMovies', {
        params: {
          type: type || undefined,
          category: genre || undefined,
          titleFilter: titleFilter || undefined,
        },
        withCredentials: true,
      });
      setMovies(response.data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleSearch = () => {
    fetchMovies(type, genre, title);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <HeaderSearch />

      <div className="p-4 flex gap-4 flex-wrap justify-center">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="Movie">Movie</option>
          <option value="TV Show">TV Show</option>
        </select>

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
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
  <h2 className="text-lg font-bold mb-4">Search Results</h2>
  {movies.length === 0 ? (
    <p>No movies found.</p>
  ) : (
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
        <div
  key={movie.showId}
  className="movie-card"
  onClick={() => {
    setSelectedMovie(movie);
    setShowOverlay(true);
  }}
>

          <div className="movie-poster-container">
            <img
              src={
                posterErrors[movie.showId]
                  ? fallbackImage
                  : getPosterImageUrl(movie.title)
              }
              alt={movie.title}
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
      ))}
    </div>
  )}
</div>
    </div>
  );
}

export default SearchPage;
