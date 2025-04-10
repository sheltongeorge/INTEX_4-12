import React, { useState, useEffect } from 'react';
import { MovieCarousel } from '../components/MovieCarousel';
import Header from '../components/header';
import { UserContext } from '../components/AuthorizeView';

const MoviesPage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch user data to personalize the welcome message and get userId
    const getUserData = async () => {
      try {
        const response = await fetch('https://localhost:7156/pingauth', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            // Set user ID if available
            if (userData.id) {
              setUserId(userData.id);
            }
            
            // Just use the part before @ in the email as name
            if (userData.email) {
              const name = userData.email.split('@')[0];
              setUserName(name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    getUserData();
  }, []);
  
  return (
    <div>
      <Header/>
      <div className="overflow-y-auto hide-scrollbar" style={{ height: '100vh', padding: '0 16px' }}>
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
          {userName ? `Welcome back, ${userName}!` : 'Welcome to CineNiche!'}
        </h1>
        
        {/* Primary carousel - Load immediately */}
        <h2 className="text-xl font-bold mb-2 text-white">Top Picks For You</h2>
        <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
          <MovieCarousel categoryTitle="Top Picks for You" categoryType="personal" />
        </div>
        <br />
        <br />
        
        {/* Load additional carousels only after a short delay to prevent overwhelming the server */}
        {userId && (
          <>
            <h2 className="text-xl font-bold mb-2 text-white">Popular This Week</h2>
            <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
              <MovieCarousel categoryTitle="Popular This Week" categoryType="trending" />
            </div>
            <br />
            <br />
            
            <h2 className="text-xl font-bold mb-2 text-white">Because You Watched</h2>
            <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
              <MovieCarousel categoryTitle="Because You Watched" categoryType="similar" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;