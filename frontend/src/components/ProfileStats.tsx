import React from 'react';
import './ProfileStats.css';

type Props = {
  totalWatched: number;
  favoriteGenre: string;
  averageRating: string;
  timeWatchedHours: number;
  profileTitle: string;
};

const ProfileStats: React.FC<Props> = ({
  totalWatched,
  favoriteGenre,
  averageRating,
  timeWatchedHours,
  profileTitle
}) => {
  return (
    <div className="profile-stats-card">
      <h2 className="stats-header">{profileTitle}</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-number">{totalWatched}</span>
          <span className="stat-label">Movies Watched</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {favoriteGenre === 'Loading...' ? '🤔 Calculating...' : favoriteGenre}
          </span>
          <span className="stat-label">Favorite Genre</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{averageRating}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{timeWatchedHours} hrs</span>
          <span className="stat-label">Time Spent</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
