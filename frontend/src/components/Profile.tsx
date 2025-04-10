import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './AuthorizeView';
import './Profile.css';


const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN =
  'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-15T09:35:14Z&st=2025-04-09T01:35:14Z&spr=https,http&sig=N%2FAK8dhBBarxwU9qBSd0aI0B5iEOqmpnKUJ6Ek1yv0k%3D';
const CONTAINER_NAME = 'movieposters';

const getPosterImageUrl = (movieTitle: string): string => {
  // Format the blob path - adjust based on your actual folder structure in Azure
  const blobPath = `${encodeURIComponent(movieTitle)}.jpg`;

  return `${BLOB_STORAGE_URL}/${CONTAINER_NAME}/${blobPath}?${BLOB_SAS_TOKEN}`;
};

const StarRatingDisplay = ({ rating }: { rating: number }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`star ${rating >= star ? 'filled' : ''}`}>
        ★
      </span>
    ))}
  </div>
);

type UserRating = {
  showId: string;
  title: string;
  rating: number;
  posterUrl?: string;
};

type WatchlistMovie = {
  showId: string;
  title: string;
  rating?: string;
  description?: string;
  posterUrl?: string;
};

const RatingCard = ({ rating }: { rating: UserRating }) => {
  const [isFallback, setIsFallback] = useState(false);
  const navigate = useNavigate();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/src/assets/Fallback.png';
    setIsFallback(true);
  };

  const handleClick = () => {
    navigate(`/movie/${rating.showId}`);
  };

  return (
    <div className="rating-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="poster-thumbnail">
        <img
          src={getPosterImageUrl(rating.title)}
          alt={rating.title}
          onError={handleImageError}
        />
        {isFallback && <div className="fallback-overlay-title">{rating.title}</div>}
      </div>
      <div className="rating-info">
        <h3>{rating.title}</h3>
        <StarRatingDisplay rating={rating.rating} />
        <p>{rating.rating}/5</p>
      </div>
    </div>
  );
};

const Profile = () => {
  const user = useContext(UserContext);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);

  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!user?.email) {
        console.warn('No user email found in context.');
        return;
      }

      try {
        const response = await fetch(
          `https://localhost:7156/api/movieratings/userratings/${encodeURIComponent(user.email)}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          setRatings(data);
        } else {
          console.error('Failed to fetch ratings.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchWatchlist = async () => {
      if (!user?.email) {
        console.warn('No user email found in context.');
        return;
      }

      try {
        const response = await fetch(
          `https://localhost:7156/api/moviewatchlist/${encodeURIComponent(user.email)}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          setWatchlist(data);
        } else {
          console.error('Failed to fetch watchlist.');
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchUserRatings();
    fetchWatchlist();
  }, [user]);

  return (
    <div className="profile-container">
      <h1 className="profile-header">Your Ratings</h1>
      {ratings.length === 0 ? (
        <p className="no-ratings">You haven't rated any movies yet.</p>
      ) : (
        <div className="ratings-grid">
          {ratings.map((r, i) => (
            <RatingCard key={i} rating={r} />
          ))}
        </div>
      )}

      <h1 className="profile-header">Your Watchlist</h1>
      {watchlist.length === 0 ? (
        <p className="no-ratings">Your watchlist is empty.</p>
      ) : (
        <div className="ratings-grid">
          {watchlist.map((movie, i) => (
            <RatingCard
              key={`watchlist-${i}`}
              rating={{
                showId: movie.showId,
                title: movie.title,
                rating: 0,
                posterUrl: `/MoviePosters/${encodeURIComponent(movie.title)}.jpg`,
              }}
            />
          ))}
        </div>
      )}
    </div>

  );
};

export default Profile;
