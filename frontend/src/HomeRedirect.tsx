import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './components/AuthorizeView';
import HomePage from './pages/HomePage';

const HomeRedirect = () => {
  const user = useContext(UserContext);

  // If user is logged in, redirect to /movies
  if (user) {
    return <Navigate to="/movies" replace />;
  }

  // Otherwise, show the homepage
  return <HomePage />;
};

export default HomeRedirect;
