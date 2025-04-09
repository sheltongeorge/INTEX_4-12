import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationsPage from './pages/RecommendationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminMoviesPage from './pages/AdminMoviesPage';
// import "keen-slider/keen-slider.min.css";
import { TestPoster } from "./components/TestPoster";
import { MovieCarousel } from "./components/MovieCarousel";
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import Profile from './components/Profile';
import AuthorizeView from './components/AuthorizeView';

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestPoster />} />
        <Route path="/admin" element={<AdminMoviesPage/>} />
        <Route path="/carousel" element={<MovieCarousel />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/profile" element={    <AuthorizeView><Profile /></AuthorizeView>} />

      </Routes>
    </Router>
  );
}

export default App;
