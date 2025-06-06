import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Navbar from './components/Navbar';
import AdminLoginPage from './pages/AdminLoginPage';
import CollegeList from './components/CollegeList';
import AdminLayout from './components/AdminLayout';
import { useState, useEffect } from 'react';
import { isAuthenticated as checkAuthStatus, getAdminLevel } from './firebase/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminLevel, setAdminLevel] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = checkAuthStatus();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setAdminLevel(getAdminLevel());
      } else {
        setAdminLevel(null);
      }
    };

    // Check session periodically
    checkAuth();
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 fixed inset-0 overflow-auto">
      <Routes>
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminLayout adminLevel={adminLevel} />
            ) : (
              <AdminLoginPage onLogin={(level) => {
                setIsAuthenticated(true);
                setAdminLevel(level);
              }} />
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
                <Route path="/colleges" element={<CollegeList />} />
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
