import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logout from './Logout';
import { AuthorizedUser } from './AuthorizeView';


const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();
  // const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/pingauth',
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUserRoles(data.roles || []);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);



  return (
    <>
      {/* Top Nav */}
      <header className="flex items-center justify-between bg-black text-white px-4 shadow-md" style={{ height: '8vh' }}>
        <div className="flex items-center h-full">
          <Link to={isAuthenticated ? '/movies' : '/'} className="flex items-center h-full">
            <img src="src/assets/cineniche.png" alt="Logo" className="h-full w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-sm text-white hover:text-gray-300 cursor-pointer">
                <AuthorizedUser value="email" />
              </Link>

              <button
                onClick={() => (window.location.href = '/privacy')}
                className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
              >
                Privacy Policy
              </button>

              {userRoles.includes('Administrator') && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
                >
                  Admin
                </button>
              )}

              <Logout>
                <button className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
                  Logout
                </button>
              </Logout>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white hover:text-gray-300 cursor-pointer">
                Login
              </Link>
              <Link to="/register" className="text-sm text-white hover:text-gray-300 cursor-pointer">
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

    </>
  );
};

export default Header;
