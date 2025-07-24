import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card } from './ui/card';

const ADMIN_PASSWORD = 'BankrollAdmin2024!'; // This can be changed to any password you prefer
const ADMIN_AUTH_KEY = 'bankroll_admin_auth';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if admin is already authenticated
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  
  // Debug info before checking if user is logged in
  // console.log("AdminRoute rendering...");
  // console.log("Current user:", currentUser);
  // console.log("Auth loading:", loading);
  // console.log("Current location:", window.location.href);
  
  // Wait for auth to load before checking user
  if (loading) {
    // console.log("Auth is still loading, showing spinner");
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check if user is logged in after auth has loaded
  if (!currentUser) {
    // console.log("No current user after auth loaded, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // console.log("User is logged in, proceeding with admin route");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      // Store authentication state
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Authentication</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded p-3">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Enter Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Access Admin Panel
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
