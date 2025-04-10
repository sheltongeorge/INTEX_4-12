import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useState, useEffect } from 'react';

// Component to handle authentication-based redirects
const HomeRedirect = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://localhost:7156/pingauth', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/movies" /> : <HomePage />;
};

function App() {
  return (
    <Router>
      {/* <AuthorizeView> */}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/recommendations" element={<AuthorizeView><RecommendationsPage /></AuthorizeView>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestPoster />} />
        <Route path="/admin" element={<AdminMoviesPage/>} />
        <Route path="/carousel" element={<AuthorizeView><MovieCarousel/></AuthorizeView> } />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/profile" element={<AuthorizeView><Profile /></AuthorizeView>} />
      </Routes>
      {/* </AuthorizeView> */}
    </Router>
  );
}

export default App;
