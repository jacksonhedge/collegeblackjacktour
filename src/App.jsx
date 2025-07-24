import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLoginPage from './pages/AdminLoginPage';
import CollegeList from './components/CollegeList';
import EventsPage from './pages/EventsPage';
import TournamentsPage from './pages/TournamentsPage';
import ShopPage from './pages/ShopPage';
import InfoPage from './pages/InfoPage';
import SubmitContentPage from './pages/SubmitContentPage';
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
    <div className="min-h-screen">
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
              <div className="min-h-screen flex flex-col">
                <div className="flex-grow">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/colleges" element={<CollegeList />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/info" element={<InfoPage />} />
                    <Route path="/submit-content" element={<SubmitContentPage />} />
                    <Route path="/tournaments" element={<TournamentsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
