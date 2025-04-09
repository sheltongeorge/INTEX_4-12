import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import logo from '../assets/cineniche.png';

function LoginPage() {
  // state variables for email and passwords
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberme, setRememberme] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(true);
  const [isLogoSpinning, setIsLogoSpinning] = useState<boolean>(false);
  
  // Always show animation on login page
  useEffect(() => {
    setShowAnimation(true);
  }, []);

  // state variable for error messages
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // handle change events for input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setRememberme(checked);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  // handle submit event for the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const loginUrl = rememberme
      ? 'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/login?useCookies=true'
      : 'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/login?useSessionCookies=true';

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include', // ✅ Ensures cookies are sent & received
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Ensure we only parse JSON if there is content
      let data = null;
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 0) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password.');
      }

      navigate('/recommendations'); // Redirect to recommendations page on success
    } catch (error: any) {
      setError(error.message || 'Error logging in.');
      console.error('Fetch attempt failed:', error);
    }
  };

  return (
    <div className="container">
      <div className={`card border-0 shadow rounded-3 ${showAnimation ? 'card-animate' : ''}`}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4 position-relative">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={logo}
                alt="CineNiche Logo"
                className={`logo-image mb-3 ${isLogoSpinning ? 'logo-spin' : ''}`}
                onClick={() => {
                  if (!isLogoSpinning) {
                    setIsLogoSpinning(true);
                    
                    // Reset the animation after it completes
                    setTimeout(() => {
                      setIsLogoSpinning(false);
                    }, 400);
                  }
                }}
              />
            </div>
          </div>
          <h5 className="card-title text-center mb-5 fw-light fs-5">
            Sign In
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
              />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
              />
              <label htmlFor="password">Password</label>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="rememberme"
                name="rememberme"
                checked={rememberme}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="rememberme">
                Remember password
              </label>
            </div>
            <div className="d-grid mb-2">
              <button
                className="btn btn-login custom-login-btn text-uppercase fw-bold"
                type="submit"
              >
                Sign in
              </button>
            </div>
            <div className="d-grid mb-2">
              <button
                className="btn btn-login custom-login-btn text-uppercase fw-bold"
                onClick={handleRegisterClick}
              >
                Register
              </button>
            </div>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;