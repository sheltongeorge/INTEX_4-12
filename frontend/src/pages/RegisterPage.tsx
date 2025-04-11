import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/cineniche.png';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [isLogoSpinning, setIsLogoSpinning] = useState<boolean>(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setShowAnimation(false);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName') setFullName(value);
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!fullName || !email || !password || !confirmPassword) {
  //     setError('Please fill in all fields.');
  //   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  //     setError('Please enter a valid email address.');
  //   } else if (password !== confirmPassword) {
  //     setError('Passwords do not match.');
  //   } else {
  //     setError('');
  //     try {
  //       // Register user in Identity database
  //       const response = await fetch(
  //         'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/register',
  //         {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({ email, password }),
  //         }
  //       );

  //       if (!response.ok) throw new Error('Registration failed.');

  //       // Register user in movies_users database
  //       const moviesUserResponse = await fetch(
  //         'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/MovieUsers/AddUser',
  //         {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({ name: fullName, email: email }),
  //         }
  //       );

  //       if (!moviesUserResponse.ok)
  //         throw new Error('Failed to add user to movie database.');

  //       setError('Successful registration. Please log in.');
  //     } catch (err) {
  //       setError((err as Error).message);
  //       console.error(err);
  //     }
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
    } else if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      setError('');
      try {
        const response = await fetch('https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.toLowerCase().includes('password')) {
            throw new Error('Password must be at least 12 characters long.');
          }
          throw new Error(
            'Registration failed. Please check your information.'
          );
        }

        const moviesUserResponse = await fetch(
          'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/MovieUsers/AddUser',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: fullName, email: email }),
          }
        );

        if (!moviesUserResponse.ok)
          throw new Error('Failed to add user to movie database.');

        setError('Successful registration. Please log in.');
      } catch (err) {
        console.error('Registration error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred during registration');
        }
      }
    }
  };


  return (
    <div className="container">
      <div
        className={`card border-0 shadow rounded-3 ${showAnimation ? 'card-animate' : ''}`}
      >
      <div
        className={`card border-0 shadow rounded-3 ${showAnimation ? 'card-animate' : ''}`}
      >
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
                    setTimeout(() => setIsLogoSpinning(false), 400);
                  }
                }}
              />
            </div>
          </div>
          <h5 className="card-title text-center mb-5 fw-light fs-5">
            Register
          </h5>
          <h5 className="card-title text-center mb-5 fw-light fs-5">
            Register
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="text"
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={handleChange}
              />
              <label htmlFor="fullName">Full Name</label>
            </div>
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
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
              />
              <label htmlFor="confirmPassword">Confirm Password</label>
            </div>

            <div className="d-grid mb-2">
              <button
                className="btn btn-login custom-login-btn text-uppercase fw-bold"
                type="submit"
              >
              <button
                className="btn btn-login custom-login-btn text-uppercase fw-bold"
                type="submit"
              >
                Register
              </button>
            </div>
            <div className="d-grid mb-2">
              <button
                className="btn btn-login custom-login-btn text-uppercase fw-bold"
                onClick={handleLoginClick}
              >
                Go to Login
              </button>
            </div>
          </form>
          <strong>{error} && <p className="error">{error}</p></strong>
        </div>
      </div>
    </div>
  );
}

export default Register;
