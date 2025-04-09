import React from 'react';
import { MovieCarousel } from '../components/MovieCarousel';


const MoviesPage: React.FC = () => {
  return (
<div className="min-h-screen overflow-y-auto p-4" style={{ height: 'auto' }}>
      <h2 className="text-xl font-bold mb-2">For you</h2>
      <MovieCarousel />
      <br />
      <br />
      <h2 className="text-xl font-bold mb-2">Action</h2>
      <MovieCarousel />
      <br />
      <br />
      <h2 className="text-xl font-bold mb-2">Shows</h2>
      <MovieCarousel />

    </div>
  );
};

export default MoviesPage;