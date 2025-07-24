import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import PINSetup from '../components/auth/PINSetup';

const SetupPINPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    // Redirect if not authenticated
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleComplete = () => {
    navigate(from, { replace: true });
  };

  const handleSkip = () => {
    navigate(from, { replace: true });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <PINSetup 
          onComplete={handleComplete} 
          onSkip={handleSkip} 
        />
      </div>
    </div>
  );
};

export default SetupPINPage;