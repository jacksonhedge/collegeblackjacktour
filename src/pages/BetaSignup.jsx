import React from 'react';
import { Link } from 'react-router-dom';

const BetaSignup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 backdrop-blur-md sticky top-0 z-50 bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            {/* Left section - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img
                  src="/images/BankrollLogoTransparent.png"
                  alt="Bankroll Logo"
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    console.error('Failed to load logo, trying fallback');
                    e.target.src = '/assets/BankrollLogoTransparent.png';
                    // If that fails too, use a text fallback
                    e.target.onerror = () => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML += '<span class="text-xl font-bold text-lime-500">Bankroll</span>';
                    };
                  }}
                />
              </Link>
            </div>

            {/* Right section - Auth Buttons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link 
                to="/login"
                className="px-4 py-2 text-sm sm:text-base text-gray-800 hover:text-lime-600 transition-colors duration-300"
              >
                Log in
              </Link>
              <Link 
                to="/signup"
                className="px-5 py-2.5 bg-lime-500 text-sm sm:text-base text-white rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-500">
            Join Our Beta Program
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Be among the first to experience our payment platform and help shape its future
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10 border border-gray-200">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSdVSTaEVM9vDDPTqZPkhKRzfeldDXnfVuGr_v9rnrg-fzl4_g/viewform?embedded=true"
            width="100%" 
            height="800px" 
            frameBorder="0" 
            marginHeight="0" 
            marginWidth="0"
            title="Beta Signup Form"
          >
            Loading form...
          </iframe>
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="text-lime-600 hover:text-lime-800 transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BetaSignup;