import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext({});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if admin is already authenticated
  useEffect(() => {
    const authToken = localStorage.getItem('bankroll_admin_auth');
    const authExpiry = localStorage.getItem('bankroll_admin_expiry');
    
    if (authToken && authExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(authExpiry);
      
      if (now < expiry) {
        setIsAuthenticated(true);
      } else {
        // Clear expired auth
        localStorage.removeItem('bankroll_admin_auth');
        localStorage.removeItem('bankroll_admin_expiry');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (password) => {
    // Admin password for notifications panel
    const ADMIN_PASSWORD = 'B@nkroll123!';
    
    console.log('AdminAuthContext login attempt with password:', password);
    
    if (password === ADMIN_PASSWORD) {
      const token = btoa(password + ':' + new Date().getTime());
      const expiry = new Date().getTime() + (6 * 60 * 60 * 1000); // 6 hours
      
      localStorage.setItem('bankroll_admin_auth', token);
      localStorage.setItem('bankroll_admin_expiry', expiry.toString());
      
      setIsAuthenticated(true);
      console.log('Login successful, isAuthenticated set to true');
      return true;
    }
    
    console.log('Login failed, wrong password');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('bankroll_admin_auth');
    localStorage.removeItem('bankroll_admin_expiry');
    setIsAuthenticated(false);
    navigate('/');
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;