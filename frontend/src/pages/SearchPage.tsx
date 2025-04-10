import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import HeaderSearch from '../components/HeaderSearch';
import fallbackImage from '../assets/Fallback.png';
import { MovieTitle } from '../types/MovieTitle';
import '../components/MovieCarousel.css';

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
      }>(
        'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/MoviesCategories/AllMovies',
        {
          params: {
            type: type || undefined,
            category: genre || undefined,
            titleFilter: titleFilter || undefined,
          },
          withCredentials: true,
        }
      );
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

      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Search Results</h2>
        {movies.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          <div className="grid grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div key={movie.showId} className="flex flex-col items-center">
                <div className="relative w-full pb-[150%] bg-gray-800 rounded overflow-hidden">
                  <img
                    src={
                      posterErrors[movie.showId]
                        ? fallbackImage
                        : getPosterImageUrl(movie.title)
                    }
                    alt={movie.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onError={() =>
                      setPosterErrors((prev) => ({
                        ...prev,
                        [movie.showId]: true,
                      }))
                    }
                  />
                  {posterErrors[movie.showId] && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className="text-white font-bold text-center px-2 bg-black bg-opacity-60 rounded">
                        {movie.title}
                      </span>
                    </div>
                  )}
                </div>
                <span className="mt-2 text-sm text-center">{movie.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
