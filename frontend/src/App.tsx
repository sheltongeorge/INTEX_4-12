import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationsPage from './pages/RecommendationsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>hello</h1>} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
