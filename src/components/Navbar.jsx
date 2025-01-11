import React, { useState } from 'react';

const Navbar = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <nav className="bg-black/30 backdrop-blur-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-white text-xl font-bold">CCL</span>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-8">
            <a href="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </a>
            
            {/* Shop Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsShopOpen(true)}
                onMouseLeave={() => setIsShopOpen(false)}
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Shop
              </button>
              
              {isShopOpen && (
                <div
                  onMouseEnter={() => setIsShopOpen(true)}
                  onMouseLeave={() => setIsShopOpen(false)}
                  className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/80 backdrop-blur-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <a href="/shop/merch" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Shirts/Merch
                    </a>
                    <a href="/shop/tables" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                      Tables
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a href="/info" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Info
            </a>
            <a href="/tournaments" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Tournaments
            </a>
            <a href="/partners" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Partners
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
