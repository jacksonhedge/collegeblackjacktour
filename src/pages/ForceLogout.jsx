import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase/config';

const ForceLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const forceLogout = async () => {
      try {
        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Force sign out from Supabase
        await supabase.auth.signOut();
        
        console.log('Force logout completed');
        
        // Wait a moment then redirect
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } catch (error) {
        console.error('Force logout error:', error);
        // Still try to redirect
        navigate('/login');
      }
    };

    forceLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Logging out...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default ForceLogout;