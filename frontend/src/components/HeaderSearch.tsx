import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './HeaderSearch.css';


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
    <div className="header-search-bar">
      <div className="genre-scroll-container">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className="genre-button"
          >
            {genre}
          </button>
        ))}
      </div>
      <button
        onClick={handleSearchClick}
        className="search-icon-button"
        aria-label="Search"
      >
        <FaSearch />
      </button>
    </div>
  );
}  
export default HeaderSearch;
