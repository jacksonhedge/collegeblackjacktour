import React, { useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import PartnersLanding from './PartnersLanding';

const PartnersRouter = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect authenticated users to the protected partners page
    if (currentUser) {
      navigate('/partner-platforms', { replace: true });
    }
  }, [currentUser, navigate]);
  
  // Show public landing page for non-authenticated users
  return <PartnersLanding />;
};

export default PartnersRouter;