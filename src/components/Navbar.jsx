import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="bg-black fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img 
                src="/CCT_Logo_2.png" 
                alt="CCL Logo" 
                className="h-10 w-auto filter brightness-100 mr-4"
              />
            </Link>
          </div>

          {/* Navigation Items - Center */}
          <div className="flex items-center flex-1 justify-center">
            <div className="flex space-x-8">
              <Link to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>

              <Link to="/shop" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Shop
              </Link>

              <Link to="/info" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Info
              </Link>

              <Link to="/submit-content" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Submit Content
              </Link>

              <Link to="/tournaments" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Tournaments
              </Link>
            </div>
          </div>

          {/* Search Bar - Right Side */}
          <div className="flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white px-4 py-1.5 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
