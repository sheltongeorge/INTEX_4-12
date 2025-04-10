import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

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

const HeaderSearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGenreClick = (genre: string) => {
    const genreParam = `/search?genre=${encodeURIComponent(genre)}`;

    if (location.pathname === '/search') {
      // Force reload if already on /search
      window.location.href = genreParam;
    } else {
      navigate(genreParam);
    }
  };

  const handleSearchClick = () => {
    if (location.pathname === '/search') {
      // Refresh page if already on /search
      window.location.href = '/search';
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between flex-wrap gap-2 shadow">
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full"
          >
            {genre}
          </button>
        ))}
      </div>
      <button
        onClick={handleSearchClick}
        className="ml-auto text-white hover:text-gray-300 text-lg"
        aria-label="Search"
      >
        <FaSearch />
      </button>
    </div>
  );
};

export default HeaderSearch;
