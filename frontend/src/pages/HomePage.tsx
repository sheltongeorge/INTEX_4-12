import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Header from '../components/Header';
import "../components/cookies/CookieConsent.css";

function HomePage() {
  const navigate = useNavigate();

  // const handleLogin = () => {
  //   navigate('/login');
  // };

  const handleSignup = () => {
    navigate('/register');
  };

  return (<div>
    <Header/>
    <div className="homepage-container d-flex flex-column min-vh-100">
      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-3">
        <h2 className="display-5 fw-bold mb-4 text-white">
          Discover Hidden Gems, Cult Classics & More
        </h2>
        <p className="lead mb-4 text-white">
          Stream curated indie films, documentaries, and international cinema
          you won't find anywhere else.
          <br />
          Starting at $7.99. Cancel anytime.
        </p>
        <button className="btn btn-lg btn-primary" onClick={handleSignup}>
          Get Started
        </button>
      </main>
    </div>
  </div>
  );
}

export default HomePage;
