import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  color?: 'blue' | 'purple' | 'white';
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  color = 'blue',
  size = 'md',
  fullScreen = false,
  text
}) => {
  const colorClasses = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    white: 'text-white'
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinnerClasses = cn(
    'animate-spin',
    colorClasses[color],
    sizeClasses[size]
  );

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
