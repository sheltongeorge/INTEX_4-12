import React from 'react';

const Header: React.FC = () => {
  const handleLogout = () => {
    console.log('Logout clicked');
    // Add your logout logic here
  };

  return (
    <header className="flex items-center justify-between bg-black text-white px-4 shadow-md" style={{ height: '8vh' }}>
      {/* Logo Section */}
      <div className="flex items-center h-full">
        <img
          src="src/assets/cineniche.png" // Replace with your logo path
          alt="Logo"
          className="h-full w-auto"
        />
        <span className="ml-2 text-lg font-bold"></span>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;