import React from 'react';
import PropTypes from 'prop-types';
import LoadingAnimation from './LoadingAnimation';

const LoadingSpinner = ({ 
  size = 'md',
  color = 'blue',
  fullScreen = false,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    white: 'border-white'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center';

  // Use the fancy loading animation for fullScreen or when text is provided
  if (fullScreen || text) {
    return (
      <div className={containerClasses}>
        <LoadingAnimation text={text} />
      </div>
    );
  }

  // Simple spinner for inline loading
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div 
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]}
            border-4 
            border-t-transparent 
            rounded-full 
            animate-spin
          `}
        />
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'white']),
  fullScreen: PropTypes.bool,
  text: PropTypes.string
};

export default LoadingSpinner;
