import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeMapContainer from '../components/CollegeMapContainer';

const BetrPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem('betrAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Set your password here
    const correctPassword = 'betr2024';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('betrAuthenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('betrAuthenticated');
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-24 w-auto"
              src="/CCT_Logo_1.png"
              alt="CCT Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Betr Access
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter password to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Access Betr
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If authenticated, render the layout with the map
  return <BetrLayout onLogout={handleLogout} />;
};

// Betr Layout Component
const BetrLayout = ({ onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Minimal Sidebar */}
      <div className="w-64 bg-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-900">
            <img src="/CCT_Logo_1.png" alt="CCT Logo" className="h-12 w-auto" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onLogout}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              College Map
            </h1>
          </div>
        </header>

        {/* Map Container */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="h-full bg-white rounded-lg shadow-lg p-4">
            <CollegeMapContainer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BetrPage;