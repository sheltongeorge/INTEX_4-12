import React, { useEffect, useState, useContext } from 'react';
import { X } from 'lucide-react';
import { UserContext } from './AuthorizeView';
import fallbackImage from '../assets/Fallback.png';
import './Profile.css';
import './MovieCarousel.css';
import Header from '../components/header';

const BLOB_STORAGE_URL = 'https://movieposterblob.blob.core.windows.net';
const BLOB_SAS_TOKEN =
  'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-15T09:35:14Z&st=2025-04-09T01:35:14Z&spr=https,http&sig=N%2FAK8dhBBarxwU9qBSd0aI0B5iEOqmpnKUJ6Ek1yv0k%3D';
const CONTAINER_NAME = 'movieposters';

const getPosterImageUrl = (movieTitle: string): string => {
  const blobPath = `${encodeURIComponent(movieTitle)}.jpg`;
  return `${BLOB_STORAGE_URL}/${CONTAINER_NAME}/${blobPath}?${BLOB_SAS_TOKEN}`;
};

const StarRatingDisplay = ({ rating }: { rating: number }) => {
  const normalizedRating = Math.round(rating / 1); // ensure it's normalized correctly

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${normalizedRating >= star ? 'filled' : ''}`}>
          
        </span>
      ))}
    </div>
  );
};



type UserRating = {
  showId: string;
  title: string;
  rating: number;
};

type WatchlistMovie = {
  showId: string;
  title: string;
  rating?: string;
  description?: string;
};

const RatingCard = ({ rating, onClick }: { rating: UserRating; onClick: () => void }) => {
  const [isFallback, setIsFallback] = useState(false);

  return (
    <div className="rating-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="poster-thumbnail">
        <img
          src={getPosterImageUrl(rating.title)}
          alt={rating.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
            setIsFallback(true);
          }}
        />
        {isFallback && <div className="fallback-overlay-title">{rating.title}</div>}
      </div>
      <div className="rating-info">
        <h3>{rating.title}</h3>
        <StarRatingDisplay rating={rating.rating} />
        {rating.rating > 0 && <p>{rating.rating}/5</p>}
      </div>
    </div>
  );
};

const MovieOverlay = ({ movie, closeOverlay }: { movie: WatchlistMovie | UserRating; closeOverlay: () => void }) => (
  <div className="movie-overlay">
    <div className="overlay-content">
      <button className="close-overlay" onClick={closeOverlay}>
        <X size={24} />
      </button>
      <div className="overlay-poster">
        <img src={getPosterImageUrl(movie.title)} alt={movie.title} onError={(e) => (e.currentTarget.src = fallbackImage)} />
      </div>
      <div className="overlay-details">
        <h2>{movie.title}</h2>
        {'rating' in movie && typeof movie.rating === 'number' && movie.rating > 0 && <StarRatingDisplay rating={movie.rating} />}
        <p>{'description' in movie ? movie.description : 'No description available.'}</p>
      </div>
    </div>
  </div>
);

const Profile = () => {
  const user = useContext(UserContext);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<WatchlistMovie | UserRating | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      const ratingsRes = await fetch(`https://localhost:7156/api/movieratings/userratings/${encodeURIComponent(user.email)}`, { credentials: 'include' });
      if (ratingsRes.ok) setRatings(await ratingsRes.json());

      const watchlistRes = await fetch(`https://localhost:7156/api/moviewatchlist/${encodeURIComponent(user.email)}`, { credentials: 'include' });
      if (watchlistRes.ok) setWatchlist(await watchlistRes.json());
    };

    fetchData();
  }, [user]);

  return (
  <div>
    <Header/>
    <div className="profile-container">
      <h1 className="profile-header">Your Ratings</h1>
      <div className="ratings-grid">
        {ratings.map((r, i) => (
          <RatingCard key={i} rating={r} onClick={() => { setSelectedMovie(r); setShowOverlay(true); }} />
        ))}
      </div>

      <h1 className="profile-header">Your Watchlist</h1>
      <div className="ratings-grid">
        {watchlist.map((movie, i) => (
          <RatingCard
            key={i}
            rating={{ ...movie, rating: 0 }}
            onClick={() => { setSelectedMovie(movie); setShowOverlay(true); }}
          />
        ))}
      </div>

      {showOverlay && selectedMovie && <MovieOverlay movie={selectedMovie} closeOverlay={() => setShowOverlay(false)} />}
    </div>
    </div>
  );
};

export default Profile;
