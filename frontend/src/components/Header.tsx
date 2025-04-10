import React, { useState, useEffect } from 'react';
import Logout from './Logout'; // Import the Logout component
import { AuthorizedUser } from './AuthorizeView';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/pingauth',
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <header className="flex items-center justify-between bg-black text-white px-4 shadow-md" style={{ height: '8vh' }}>
      {/* Logo Section */}
      <div className="flex items-center h-full">
        <Link to={isAuthenticated ? "/movies" : "/"} className="flex items-center h-full">
          <img
            src="src/assets/cineniche.png"
            alt="Logo"
            className="h-full w-auto"
          />
        </Link>
        <span className="ml-2 text-lg font-bold"></span>
      </div>

      {/* User Info and Logout Section */}
      <div className="flex items-center" style={{ gap: '16px' }}>
        {isAuthenticated ? (
          <>
            {/* Username Button - Show actual user email when authenticated */}
            <Link to="/profile" className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
              <AuthorizedUser value="email" />
            </Link>

            {/* Privacy Policy Button */}
            <button
              onClick={() => (window.location.href = '/privacy')}
              className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              Privacy Policy
            </button>

            {/* Logout Button */}
            <Logout>
              <button className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
                Logout
              </button>
            </Logout>
          </>
        ) : (
          <>
            {/* Show login/register buttons when not authenticated */}
            <Link to="/login" className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
              Login
            </Link>
            <Link to="/register" className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
              Register
            </Link>
            <button
              onClick={() => (window.location.href = '/privacy')}
              className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              Privacy Policy
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;