import React, { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { UserContext } from './AuthorizeView';
import fallbackImage from '../assets/Fallback.png';
import './MovieCarousel.css';

const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN = 'your-sas-token-here';
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
  };
  
  

const MovieOverlay: React.FC<OverlayProps> = ({ movie, onClose, initialRating }) => {
  const user = useContext(UserContext);
  const [userRating, setUserRating] = useState<number | null>(initialRating ?? null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);


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
        </div>
      </div>
    </div>
  );
};

export default MovieOverlay;
