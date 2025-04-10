import React from 'react';
import { MovieCarousel } from '../components/MovieCarousel';
import Header from '../components/Header';


const MoviesPage: React.FC = () => {
  return (
<div>
    <Header/>
<div className= "overflow-y-auto hide-scrollbar" style={{ height: '100vh' }}>
    <h2 className="text-xl font-bold mb-2 text-white">For you</h2>
    <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
      <MovieCarousel />
    </div>
      <br />
      <br />
    <h2 className="text-xl font-bold mb-2 text-white">For you</h2>
    <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
      <MovieCarousel />
    </div>
      <br />
      <br />
      <h2 className="text-xl font-bold mb-2 text-white">For you</h2>
    <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
      <MovieCarousel />
    </div>
    </div>
    </div>
  );
};

export default MoviesPage;