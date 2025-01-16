import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Navbar from './components/Navbar';
import TournamentsPage from './pages/TournamentsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminLayout';
import { useState, useEffect } from 'react';
import { isAuthenticated as checkAuthStatus } from './firebase/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(checkAuthStatus());
    };

    // Check session periodically
    checkAuth();
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminLayout />
            ) : (
              <AdminLoginPage onLogin={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/tournaments/:type" element={<TournamentsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
