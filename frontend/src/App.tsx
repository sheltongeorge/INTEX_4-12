import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationsPage from './pages/RecommendationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminMoviesPage from './pages/AdminMoviesPage';
// import "keen-slider/keen-slider.min.css";
// import { MovieCarousel } from './components/MovieCarousel'; // adjust path if needed



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecommendationsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminMoviesPage/>} />
        {/* <Route path="/carousel" element={<MovieCarousel />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
