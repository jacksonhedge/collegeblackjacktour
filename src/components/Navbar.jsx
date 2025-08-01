import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [showEventsDropdown, setShowEventsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowEventsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

              {/* Tournaments Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowEventsDropdown(!showEventsDropdown)}
                  className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                >
                  Tournaments
                  <svg 
                    className={`ml-1 w-4 h-4 transition-transform ${showEventsDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showEventsDropdown && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/events/scheduled"
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={() => setShowEventsDropdown(false)}
                      >
                        Scheduled
                      </Link>
                      <Link
                        to="/events/completed"
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={() => setShowEventsDropdown(false)}
                      >
                        Completed
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Info - Non-clickable */}
              <div className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Info
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
