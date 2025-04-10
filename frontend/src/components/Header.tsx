import React, { useContext } from 'react';
import Logout from './Logout';
import { UserContext } from './AuthorizeView';

const Header: React.FC = () => {
  const user = useContext(UserContext);

  return (
    <header className="flex items-center justify-between bg-black text-white px-4 shadow-md" style={{ height: '8vh' }}>
      {/* Logo */}
      <div className="flex items-center h-full">
        <a href="/movies" className="flex items-center h-full">
          <img src="src/assets/cineniche.png" alt="Logo" className="h-full w-auto" />
        </a>
      </div>

      {/* Right Side */}
      <div className="flex items-center" style={{ gap: '16px' }}>
        {user ? (
          <>
            {/* Show email */}
            <span className="text-sm text-white">{user.email}</span>

            {/* Privacy Policy */}
            <button
              onClick={() => (window.location.href = '/privacy')}
              className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              Privacy Policy
            </button>

            {/* Admin link (only if role includes Administrator) */}
            {user.roles.includes('Administrator') && (
              <button
                onClick={() => (window.location.href = '/admin')}
                className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
              >
                Admin
              </button>
            )}

            {/* Logout */}
            <Logout>
              <button className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
                Logout
              </button>
            </Logout>
          </>
        ) : (
          <>
            <button
              onClick={() => (window.location.href = '/privacy')}
              className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              Privacy Policy
            </button>

            <button
              onClick={() => (window.location.href = '/login')}
              className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              Login
            </button>

            <button
              onClick={() => (window.location.href = '/register')}
              className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
