import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { analyticsService } from '../../services/firebase/AnalyticsService';

const TrackedClick = ({ 
  children, 
  elementId, 
  elementType, 
  pageName, 
  onClick, 
  ...props 
}) => {
  const { currentUser } = useAuth();

  const handleClick = (e) => {
    // Log the click event with user information
    analyticsService.logClick(
      elementId, 
      elementType, 
      pageName,
      currentUser // Pass the entire user object
    );
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return React.cloneElement(children, {
    ...props,
    onClick: handleClick
  });
};

export default TrackedClick;
