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

      {/* Logout Button */}
      <Logout>
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded">
          Logout
        </button>
      </Logout>
    </header>
  );
};

export default Header;