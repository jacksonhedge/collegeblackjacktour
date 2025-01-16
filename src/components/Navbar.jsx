import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-black backdrop-blur-lg fixed w-full z-50">
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

          {/* Navigation Items */}
          <div className="flex items-center justify-between flex-1">
            <div className="flex space-x-8">
              <Link to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              
              {/* Shop - Non-clickable */}
              <div className="relative">
                <div className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center cursor-not-allowed">
                  Shop
                  <svg 
                    className="ml-1 w-4 h-4"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Info - Non-clickable */}
              <div className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Info
              </div>
              
              {/* Tournaments - Non-clickable */}
              <div className="relative">
                <div className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center cursor-not-allowed">
                  Tournaments
                  <svg 
                    className="ml-1 w-4 h-4"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Partners - Non-clickable */}
              <div className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Partners
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
