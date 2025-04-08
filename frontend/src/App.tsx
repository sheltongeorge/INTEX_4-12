import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationsPage from './pages/RecommendationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import "keen-slider/keen-slider.min.css";
import { TestPoster } from "./components/TestPoster";
import { MovieCarousel } from "./components/MovieCarousel";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecommendationsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestPoster />} />
        <Route path="/carousel" element={<MovieCarousel />} />

      </Routes>
    </Router>
  );
}

export default App;
