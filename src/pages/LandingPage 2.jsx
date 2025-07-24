import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import Footer from '../layout/Footer';
import AnimatedGradient from '../components/ui/AnimatedGradient';
import { useSleeperContext } from '../contexts/SleeperContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white relative">
      <AnimatedGradient />
      
      {/* Navigation Bar */}
      <nav className="border-b border-purple-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left section */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div 
                className="flex-shrink-0 cursor-pointer" 
                onClick={() => navigate('/')}
              >
                <img
                  src="/images/Bankroll Gradient 3.jpg"
                  alt="Bankroll Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                {/* What We Offer Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-1 hover:text-purple-400 transition-colors duration-300"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>What We Offer</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-purple-900/90 backdrop-blur-sm rounded-lg shadow-lg py-1 border border-purple-700">
                      <a href="#" className="block px-4 py-2 hover:bg-purple-800/50 transition-colors duration-300">
                        Feature 1
                      </a>
                      <a href="#" className="block px-4 py-2 hover:bg-purple-800/50 transition-colors duration-300">
                        Feature 2
                      </a>
                      <a href="#" className="block px-4 py-2 hover:bg-purple-800/50 transition-colors duration-300">
                        Feature 3
                      </a>
                    </div>
                  )}
                </div>
                
                <a href="#" className="hover:text-purple-400 transition-colors duration-300">
                  Spend Card
                </a>
                <a href="#" className="hover:text-purple-400 transition-colors duration-300">
                  Invest
                </a>
                <a href="#" className="hover:text-purple-400 transition-colors duration-300">
                  Bankroll Manager
                </a>
                <a href="#" className="hover:text-purple-400 transition-colors duration-300">
                  Learn
                </a>
                <a href="#" className="hover:text-purple-400 transition-colors duration-300">
                  Support
                </a>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              <button 
                className="px-4 py-2 text-white hover:text-purple-400 transition-colors duration-300"
                onClick={handleLogin}
              >
                Log in
              </button>
              <button 
                className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                onClick={handleSignUp}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-32 relative z-10">
        <div className="text-center">
          <img
            src="/images/Bankroll Gradient 3.jpg"
            alt="Bankroll Logo"
            className="h-96 w-auto object-contain mx-auto mb-8"
          />
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Your new betting wallet
          </h1>
          <p className="text-2xl text-purple-300 mb-12">
            Coming August 2024
          </p>
          <button 
            className="px-8 py-4 bg-green-500 text-white rounded-full text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
            onClick={handleSignUp}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <div className="bg-purple-900/30 backdrop-blur-sm p-8 rounded-2xl hover:bg-purple-800/40 transition-all duration-300 transform hover:scale-105 border border-purple-700/50">
            <h3 className="text-2xl font-semibold mb-4">Smart Spending</h3>
            <p className="text-purple-200">
              Track your spending and earn rewards on every transaction
            </p>
          </div>
          <div className="bg-purple-900/30 backdrop-blur-sm p-8 rounded-2xl hover:bg-purple-800/40 transition-all duration-300 transform hover:scale-105 border border-purple-700/50">
            <h3 className="text-2xl font-semibold mb-4">Intelligent Investing</h3>
            <p className="text-purple-200">
              Make informed decisions with our advanced analytics
            </p>
          </div>
          <div className="bg-purple-900/30 backdrop-blur-sm p-8 rounded-2xl hover:bg-purple-800/40 transition-all duration-300 transform hover:scale-105 border border-purple-700/50">
            <h3 className="text-2xl font-semibold mb-4">Bankroll Management</h3>
            <p className="text-purple-200">
              Keep your finances in check with our powerful tools
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
