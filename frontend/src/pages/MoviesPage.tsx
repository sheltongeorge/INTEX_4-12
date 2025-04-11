import React, { useState, useEffect } from 'react';
import { MovieCarousel } from '../components/MovieCarousel';
import Header from '../components/header';
import LazyCarousel from '../components/LazyCarousel';
import HeaderSearch from '../components/HeaderSearch';
import './MoviesPage.css'; 
import { UserContext } from '../components/AuthorizeView';

const MoviesPage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [topRatedMovies, setTopRatedMovies] = useState<{title: string, showId: string}[]>([]);
  const [recommendationsMap, setRecommendationsMap] = useState<Record<string, any[]>>({});

  type Movie = {
    showId: string;
    title: string;
    rating: string;
    description: string;
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch('https://localhost:7156/pingauth', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            if (userData.email) {
              setUserEmail(userData.email);
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

  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        const response = await fetch(`https://localhost:7156/api/movieratings/userratings/${encodeURIComponent(userEmail)}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const ratings = await response.json();
          if (ratings.length > 0) {
            // Sort ratings by rating value in descending order
            const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);
            
            // Take the top 5 or fewer if user hasn't rated 5 movies
            const top5Ratings = sortedRatings.slice(0, 5);
            
            // Extract title and showId from each rating
            const topMovies = top5Ratings.map(rating => ({
              title: rating.title,
              showId: rating.showId
            }));
            
            setTopRatedMovies(topMovies);
            console.log('Top 5 rated movies:', topMovies.map(m => m.title));
          }
        }
      } catch (error) {
        console.error('Error fetching user ratings:', error);
      }
    };

    if (userEmail) {
      fetchTopRatedMovies();
    }
  }, [userEmail]);

  useEffect(() => {
    const fetchRecommendationsData = async (movieTitle: string): Promise<any[]> => {
      try {
        const response = await fetch('https://localhost:7156/api/Recommendations/AllRecommendations1', {
          credentials: 'include',
          signal: AbortSignal.timeout(3000)
        });
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return await response.json();
      } catch (err) {
        console.error('Recommender error:', err);
        return [];
      }
    };

    const findBestRecommendationMatch = (recs: any[], title: string) => {
      let match = recs.find(r => r.if_you_liked.toLowerCase().trim() === title.toLowerCase().trim());
      if (!match) {
        match = recs.find(r => title.toLowerCase().includes(r.if_you_liked.toLowerCase()));
      }
      return match;
    };

    const fetchMovieDetailsForTitles = async (titles: string[]): Promise<Movie[]> => {
      try {
        const res = await fetch('https://localhost:7156/api/MoviesTitles', {
          credentials: 'include',
          signal: AbortSignal.timeout(3000)
        });
        const allMovies = await res.json();
        return titles.map(t => allMovies.find((m: Movie) => m.title.toLowerCase() === t.toLowerCase())).filter(Boolean);
      } catch (err) {
        console.error('Failed to fetch movies for recommendations:', err);
        return [];
      }
    };

    const getRecommendedMoviesForAll = async () => {
      if (topRatedMovies.length === 0) return;
      
      // Get all recommendations data once (to avoid multiple API calls)
      const allRecsData = await fetchRecommendationsData("");
      const newRecommendationsMap: Record<string, any[]> = {};
      
      // Process each top rated movie
      for (const movie of topRatedMovies) {
        const bestMatch = findBestRecommendationMatch(allRecsData, movie.title);
        
        if (bestMatch) {
          const titles = [
            bestMatch.recommendation1,
            bestMatch.recommendation2,
            bestMatch.recommendation3,
            bestMatch.recommendation4,
            bestMatch.recommendation5,
            bestMatch.recommendation6,
            bestMatch.recommendation7,
            bestMatch.recommendation8
          ].filter(Boolean);
          
          const found = await fetchMovieDetailsForTitles(titles);
          if (found.length > 0) {
            newRecommendationsMap[movie.title] = found;
            console.log(`Found ${found.length} recommendations for "${movie.title}"`);
          }
        }
      }
      
      setRecommendationsMap(newRecommendationsMap);
    };

    getRecommendedMoviesForAll();
  }, [topRatedMovies]);

  return (
    <div>
      <Header />
      <HeaderSearch />
      <div
        className="overflow-y-auto hide-scrollbar"
        style={{ height: '100vh', padding: '0 16px', overflow: 'visible' }} // <--- important
      >
        <h1 className="text-2xl font-bold movies-welcome-header text-white">
          {userName ? `Welcome back, ${userName}!` : 'Welcome to CineNiche!'}
        </h1>
  
        {/* First carousel */}
        <div className="lazy-carousel-wrapper">
          <LazyCarousel title="Top Picks For You">
            <MovieCarousel categoryTitle="Top Picks for You" categoryType="personal" />
          </LazyCarousel>
        </div>
  
        {/* Second carousel */}
        <div className="lazy-carousel-wrapper">
          <LazyCarousel title="Recently Added">
            <MovieCarousel categoryTitle="Recently Added" categoryType="recently_added" />
          </LazyCarousel>
        </div>
  
        {/* Third carousel */}
        <div className="lazy-carousel-wrapper">
          <LazyCarousel title="Top Reviewed">
            <MovieCarousel categoryTitle="Top Reviewed" categoryType="top_rated" />
          </LazyCarousel>
        </div>
  
        {/* Personalized recommendations */}
        {topRatedMovies.map((movie) =>
          recommendationsMap[movie.title] && recommendationsMap[movie.title].length > 0 && (
            <div key={movie.showId} className="lazy-carousel-wrapper">
              <LazyCarousel title={`Because you liked "${movie.title}"`}>
                <MovieCarousel
                  categoryTitle={`Because you liked ${movie.title}`}
                  customMovies={recommendationsMap[movie.title]}
                />
              </LazyCarousel>
            </div>
          )
        )}
      </div>
    </div>
  );
  
};

export default MoviesPage;
