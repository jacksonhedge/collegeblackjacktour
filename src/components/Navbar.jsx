import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
                className="h-10 w-auto filter brightness-100"
              />
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center">
            <div className="flex space-x-8">
              <Link to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>

              <Link to="/shop" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Shop
              </Link>

              <Link to="/tournaments" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Tournaments
              </Link>

              <Link to="/submit-content" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Submit Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
