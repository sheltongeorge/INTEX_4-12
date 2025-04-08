import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/register');
  };

  return (
    <div className="homepage-container d-flex flex-column min-vh-100">
      <header className="d-flex justify-content-between align-items-center p-4">
        <h1 className="fw-bold">CineNiche</h1>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={handleLogin}>
            Login
          </button>
          <button className="btn btn-primary" onClick={handleSignup}>
            Sign Up
          </button>
        </div>
      </header>

      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-3">
        <h2 className="display-5 fw-bold mb-4">
          Discover Hidden Gems, Cult Classics & More
        </h2>
        <p className="lead mb-4">
          Stream curated indie films, documentaries, and international cinema you won't find anywhere else.
          <br />
          Starting at $7.99. Cancel anytime.
        </p>
        <button className="btn btn-lg btn-primary" onClick={handleSignup}>
          Get Started
        </button>
      </main>
    </div>
  );
}

export default HomePage;