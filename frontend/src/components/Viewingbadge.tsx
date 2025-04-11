import React from 'react';
import './ViewingBadge.css';

type Props = {
  totalWatched: number;
};

const badgeSteps = [
  { count: 0, emoji: '🎬', title: 'Newbie Watcher' },  // Starting badge
  { count: 30, emoji: '🍿', title: 'Casual Critic' },
  { count: 100, emoji: '🎞️', title: 'Movie Buff' },
  { count: 250, emoji: '🧠', title: 'Cinematic Scholar' },
  { count: 1000, emoji: '🏆', title: 'Film Legend' },
  { count: 3000, emoji: '👑', title: 'Immortal Cinephile' }
];

const ViewingBadge: React.FC<Props> = ({ totalWatched }) => {
  // Find the highest badge the user has unlocked
  let currentBadgeIndex = 0;
  for (let i = 0; i < badgeSteps.length; i++) {
    if (totalWatched >= badgeSteps[i].count) {
      currentBadgeIndex = i;
    } else {
      break;
    }
  }
  
  const currentBadge = badgeSteps[currentBadgeIndex];
  const nextBadge = badgeSteps[currentBadgeIndex + 1];
  const moviesNeededForNext = nextBadge ? nextBadge.count - totalWatched : 0;
  
  return (
    <div className="viewing-badge">
      <div className="badge-emoji">{currentBadge.emoji}</div>
      <div className="badge-title">{currentBadge.title}</div>
      <div className="badge-count">Movies Watched: {totalWatched}</div>
      {nextBadge && nextBadge.count !== Infinity && (
        <div className="badge-next">
          Only <strong>{moviesNeededForNext}</strong> more to unlock {nextBadge.emoji}{' '}
          <strong>{nextBadge.title}</strong>!
        </div>
      )}
    </div>
  );
};

export default ViewingBadge;
