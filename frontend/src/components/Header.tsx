import React from 'react';
import Logout from './Logout'; // Import the Logout component

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between bg-black text-white px-4 shadow-md" style={{ height: '8vh' }}>
      {/* Logo Section */}
      <div className="flex items-center h-full">
        <a href="/" className="flex items-center h-full">
          <img
            src="src/assets/cineniche.png"
            alt="Logo"
            className="h-full w-auto"
          />
        </a>
        <span className="ml-2 text-lg font-bold"></span>
      </div>

      {/* User Info and Logout Section */}
      <div className="flex items-center" style={{ gap: '16px' }}>
        {/* Username Button */}
        <button className="text-sm text-white hover:text-gray-300 bg-transparent border-none cursor-pointer">
          Username
        </button>

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
      </div>
    </header>
  );
};

export default Header;