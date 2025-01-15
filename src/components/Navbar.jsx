import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);

  return (
    <nav className="bg-black/30 backdrop-blur-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-white text-xl font-bold">CCL</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center justify-between flex-1">
            <div className="flex space-x-8">
            <Link to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            
            {/* Shop Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                Shop
                <svg 
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isShopOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/80 backdrop-blur-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <Link to="/shop/merch" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Shirts/Merch
                    </Link>
                    <Link to="/shop/tables" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Tables
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/info" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Info
            </Link>
            
            {/* Tournaments Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTournamentsOpen(!isTournamentsOpen)}
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                Tournaments
                <svg 
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${isTournamentsOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isTournamentsOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/80 backdrop-blur-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <Link to="/tournaments/previous" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Previous Tournaments
                    </Link>
                    <Link to="/tournaments/upcoming" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Upcoming Tournaments
                    </Link>
                    <Link to="/tournaments/scheduled" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Scheduled Tournaments
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/partners" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Partners
            </Link>
            </div>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
