import { useEffect, useState, useContext } from 'react';
import { UserContext } from './AuthorizeView';
import './Profile.css'; // Create this for styling

// Star display component
const StarRatingDisplay = ({ rating }: { rating: number }) => {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${rating >= star ? 'filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

type UserRating = {
  title: string;
  rating: number;
  posterUrl?: string;
};

const Profile = () => {
  const user = useContext(UserContext);
  const [ratings, setRatings] = useState<UserRating[]>([]);

  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!user?.email) {
        console.warn('No user email found in context.');
        return;
      }

      try {
        const response = await fetch(
          `https://localhost:7156/api/movieratings/userratings/${encodeURIComponent(user.email)}`,
          {
            credentials: 'include',
          }
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

    fetchUserRatings();
  }, [user]);

  return (
    
    <div className="profile-container">
      <h1 className="profile-header">Your Ratings</h1>
      {ratings.length === 0 ? (
        <p className="no-ratings">You haven't rated any movies yet.</p>
      ) : (
        <div className="ratings-grid">
          {ratings.map((r, i) => (
            <div className="rating-card" key={i}>
              <div className="poster-thumbnail">
                <img
                  src={`https://localhost:7156/MoviePosters/${encodeURIComponent(
                    r.title
                  )}.jpg`}
                  alt={r.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/src/assets/Fallback.png';
                  }}
                />
              </div>
              <div className="rating-info">
                <h3>{r.title}</h3>
                <StarRatingDisplay rating={r.rating} />
                <p>{r.rating}/5</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default Profile;

<div style={{ height: '2000px', backgroundColor: '#111' }} />