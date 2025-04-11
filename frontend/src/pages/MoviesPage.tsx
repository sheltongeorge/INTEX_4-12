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

  // Mock data for the recommendation carousels
  const mockRecommendations = {
    shawshank: [
      { showId: "s1", title: "The Green Mile", rating: "R", description: "A supernatural drama set in a prison" },
      { showId: "s2", title: "Cool Hand Luke", rating: "PG-13", description: "A prison drama about defiance" },
      { showId: "s3", title: "Escape from Alcatraz", rating: "PG", description: "Based on the 1962 prison escape" },
      { showId: "s4", title: "The Great Escape", rating: "PG", description: "WWII prisoners plan a mass escape" },
      { showId: "s5", title: "Papillon", rating: "R", description: "A prisoner's repeated attempts to escape" }
    ],
    inception: [
      { showId: "i1", title: "Memento", rating: "R", description: "A man with short-term memory loss" },
      { showId: "i2", title: "The Matrix", rating: "R", description: "A computer hacker discovers the truth" },
      { showId: "i3", title: "Shutter Island", rating: "R", description: "A U.S. Marshal investigates a disappearance" },
      { showId: "i4", title: "Eternal Sunshine", rating: "R", description: "A couple erases memories of each other" },
      { showId: "i5", title: "Interstellar", rating: "PG-13", description: "A team of explorers travel through a wormhole" }
    ],
    darkKnight: [
      { showId: "d1", title: "Batman Begins", rating: "PG-13", description: "Bruce Wayne's origin story" },
      { showId: "d2", title: "The Dark Knight Rises", rating: "PG-13", description: "Batman faces Bane" },
      { showId: "d3", title: "Joker", rating: "R", description: "The origin of Batman's nemesis" },
      { showId: "d4", title: "Man of Steel", rating: "PG-13", description: "Superman's origin story" },
      { showId: "d5", title: "Wonder Woman", rating: "PG-13", description: "Diana Prince's first adventure" }
    ],
    pulpFiction: [
      { showId: "p1", title: "Reservoir Dogs", rating: "R", description: "Aftermath of a jewelry store heist" },
      { showId: "p2", title: "Django Unchained", rating: "R", description: "A freed slave searches for his wife" },
      { showId: "p3", title: "Kill Bill", rating: "R", description: "A former assassin seeks revenge" },
      { showId: "p4", title: "The Hateful Eight", rating: "R", description: "Eight strangers seek shelter from a blizzard" },
      { showId: "p5", title: "Inglourious Basterds", rating: "R", description: "A plan to assassinate Nazi leaders" }
    ],
    godfather: [
      { showId: "g1", title: "Goodfellas", rating: "R", description: "The story of Henry Hill and his mobster friends" },
      { showId: "g2", title: "Casino", rating: "R", description: "Greed, deception, and power in Las Vegas" },
      { showId: "g3", title: "Scarface", rating: "R", description: "The rise and fall of Tony Montana" },
      { showId: "g4", title: "The Departed", rating: "R", description: "An undercover cop and an informant" },
      { showId: "g5", title: "Heat", rating: "R", description: "A group of professional bank robbers" }
    ]
  };

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
    <UserContext.Provider value={{ email: userEmail || '', roles: [], userId: 0 }}>
      <div>
        <Header />
        <HeaderSearch />
        <div
          className="overflow-y-auto hide-scrollbar"
          style={{ height: '100vh', padding: '0 16px', overflow: 'visible' }} 
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

          {/* User's top rated movie recommendations */}
          {topRatedMovies.length > 0 ? (
            // Map through the user's actual top rated movies
            topRatedMovies.map((movie, index) => {
              // Check if we have recommendations for this movie
              const hasRealRecs = recommendationsMap[movie.title] && recommendationsMap[movie.title].length > 0;
              
              // Determine which movies to display
              let moviesToDisplay;
              let categorySubtitle;
              
              if (hasRealRecs) {
                // Use real recommendations if available
                moviesToDisplay = recommendationsMap[movie.title];
                categorySubtitle = "Personalized Recommendations";
              } else {
                // Otherwise fall back to mock data based on index
                const mockSets = [
                  mockRecommendations.shawshank, 
                  mockRecommendations.inception,
                  mockRecommendations.darkKnight,
                  mockRecommendations.pulpFiction,
                  mockRecommendations.godfather
                ];
                moviesToDisplay = mockSets[index % mockSets.length];
                categorySubtitle = "Similar Movies You Might Like";
              }
              
              return (
                <div key={movie.showId} className="lazy-carousel-wrapper">
                  <LazyCarousel title={`Because you liked "${movie.title}"`}>
                    <MovieCarousel 
                      categoryTitle={categorySubtitle}
                      customMovies={moviesToDisplay} 
                    />
                  </LazyCarousel>
                </div>
              );
            })
          ) : (
            // If no top rated movies, show static recommendations
            <>
              <div className="lazy-carousel-wrapper">
                <LazyCarousel title="Because you liked 'The Shawshank Redemption'">
                  <MovieCarousel 
                    categoryTitle="Prison Drama Recommendations" 
                    customMovies={mockRecommendations.shawshank} 
                  />
                </LazyCarousel>
              </div>
              
              <div className="lazy-carousel-wrapper">
                <LazyCarousel title="Because you liked 'Inception'">
                  <MovieCarousel 
                    categoryTitle="Mind-Bending Thrillers" 
                    customMovies={mockRecommendations.inception} 
                  />
                </LazyCarousel>
              </div>
              
              <div className="lazy-carousel-wrapper">
                <LazyCarousel title="Because you liked 'The Dark Knight'">
                  <MovieCarousel 
                    categoryTitle="Superhero Movies" 
                    customMovies={mockRecommendations.darkKnight} 
                  />
                </LazyCarousel>
              </div>
              
              <div className="lazy-carousel-wrapper">
                <LazyCarousel title="Because you liked 'Pulp Fiction'">
                  <MovieCarousel 
                    categoryTitle="Cult Classics" 
                    customMovies={mockRecommendations.pulpFiction} 
                  />
                </LazyCarousel>
              </div>
              
              <div className="lazy-carousel-wrapper">
                <LazyCarousel title="Because you liked 'The Godfather'">
                  <MovieCarousel 
                    categoryTitle="Crime Dramas" 
                    customMovies={mockRecommendations.godfather} 
                  />
                </LazyCarousel>
              </div>
            </>
          )}
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default MoviesPage;
