import React, { useState, useEffect } from 'react';
import { MovieCarousel } from '../components/MovieCarousel';
import Header from '../components/header';

const MoviesPage: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [topRatedTitle, setTopRatedTitle] = useState<string | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<any[]>([]);

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
    const fetchTopRatedMovie = async () => {
      try {
        const response = await fetch(`https://localhost:7156/api/movieratings/userratings/${encodeURIComponent(userEmail)}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const ratings = await response.json();
          if (ratings.length > 0) {
            const highestRated = ratings.reduce((max: any, curr: any) => curr.rating > max.rating ? curr : max, ratings[0]);
            setTopRatedTitle(highestRated.title);
          }
        }
      } catch (error) {
        console.error('Error fetching user ratings:', error);
      }
    };

    if (userEmail) {
      fetchTopRatedMovie();
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

    const getRecommendedMovies = async () => {
      if (!topRatedTitle) return;
      const recs = await fetchRecommendationsData(topRatedTitle);
      const bestMatch = findBestRecommendationMatch(recs, topRatedTitle);

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
        setRecommendedMovies(found);
      }
    };

    getRecommendedMovies();
  }, [topRatedTitle]);

  return (
    <div>
      <Header />
      <div className="overflow-y-auto hide-scrollbar" style={{ height: '100vh', padding: '0 16px' }}>
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
          {userName ? `Welcome back, ${userName}!` : 'Welcome to CineNiche!'}
        </h1>

        <h2 className="text-xl font-bold mb-2 text-white">Top Picks For You</h2>
        <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
          <MovieCarousel categoryTitle="Top Picks for You" categoryType="personal" />
        </div>

        <br /><br />

        <h2 className="text-xl font-bold mb-2 text-white">Recently Added</h2>
        <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
          <MovieCarousel categoryTitle="Recently Added" categoryType="recently_added" />
        </div>

        <br /><br />

        <h2 className="text-xl font-bold mb-2 text-white">Top Reviewed</h2>
        <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
          <MovieCarousel categoryTitle="Top Reviewed" categoryType="top_rated" />
        </div>

        {recommendedMovies.length > 0 && (
          <>
            <br /><br />
            <h2 className="text-xl font-bold mb-2 text-white">
              Because you liked "{topRatedTitle}"
            </h2>
            <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
              <MovieCarousel categoryTitle="Because you watched" customMovies={recommendedMovies} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
