import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationsPage from './pages/RecommendationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminMoviesPage from './pages/AdminMoviesPage';
// import "keen-slider/keen-slider.min.css";
import { TestPoster } from "./components/TestPoster";
import { MovieCarousel } from "./components/MovieCarousel";
// import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import Profile from './components/Profile';
import AuthorizeView from './components/AuthorizeView';
import HomeRedirect from './HomeRedirect';

function App() {
  return (
    <Router>
      <AuthorizeView>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestPoster />} />
        <Route path="/admin" element={<AuthorizeView><AdminMoviesPage/></AuthorizeView>} />
        <Route path="/carousel" element={<MovieCarousel />} />
<<<<<<< HEAD
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/profile" element={<Profile />} />

=======
        <Route path="/movies" element={<AuthorizeView><MoviesPage /></AuthorizeView>} />
        <Route path="/profile" element={    <AuthorizeView><Profile /></AuthorizeView>} />
>>>>>>> b2bb270dfbd9d3320ebeb24f49024ee217d55a18
      </Routes>
      </AuthorizeView>
    </Router>
  );
}

export default App;
