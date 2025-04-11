import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationsPage from './pages/RecommendationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminMoviesPage from './pages/AdminMoviesPage';
// import "keen-slider/keen-slider.min.css";
import { TestPoster } from "./components/TestPoster";
import { MovieCarousel } from "./components/MovieCarousel";
import MoviesPage from './pages/MoviesPage';
import Profile from './components/Profile';
import AuthorizeView from './components/AuthorizeView';
import HomeRedirect from './HomeRedirect';

// Component to handle authentication-based redirects

import PrivacyPolicyPage from './pages/PrivacyPolicy';

function App() {
  return (
    <Router>
      {/* <AuthorizeView> */}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/recommendations"
          element={
            <AuthorizeView>
              <RecommendationsPage />
            </AuthorizeView>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestPoster />} />
        <Route path="/admin" element={<AdminMoviesPage />} />
        <Route path="/carousel" element={<MovieCarousel />} />
        <Route
          path="/movies"
          element={
            <AuthorizeView>
              <MoviesPage />
            </AuthorizeView>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthorizeView>
              <Profile />
            </AuthorizeView>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>
      {/* </AuthorizeView> */}
    </Router>
  );
}

export default App;
