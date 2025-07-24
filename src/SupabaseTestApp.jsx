import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import TestSupabase from './pages/TestSupabase';
import SignUpFormSupabase from './components/auth/SignUpFormSupabase';

// Simple navigation component
const Navigation = () => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="container mx-auto flex gap-4">
      <Link to="/" className="hover:text-gray-300">Test Dashboard</Link>
      <Link to="/signup" className="hover:text-gray-300">Sign Up Flow</Link>
    </div>
  </nav>
);

// Main test app component
const SupabaseTestApp = () => {
  return (
    <SupabaseAuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <Routes>
            <Route path="/" element={<TestSupabase />} />
            <Route path="/signup" element={<SignUpFormSupabase />} />
          </Routes>
        </div>
      </Router>
    </SupabaseAuthProvider>
  );
};

export default SupabaseTestApp;