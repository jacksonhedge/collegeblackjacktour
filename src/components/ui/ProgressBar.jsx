import React from 'react';

const ProgressBar = ({ current, min, max, className = '' }) => {
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);
  const minPercentage = (min / max) * 100;
  const hasReachedMin = current >= min;

  return (
    <div className={`w-full ${className}`}>
      <div 
        className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
      >
        {/* Background pulse animation when near min threshold */}
        {current >= min * 0.8 && current < min && (
          <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-full" />
        )}

        {/* Progress fill */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out rounded-full ${
            hasReachedMin 
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}
          style={{ 
            width: `${percentage}%`,
            boxShadow: hasReachedMin ? '0 0 12px rgba(34, 197, 94, 0.4)' : undefined
          }}
        />
        
        {/* Minimum threshold marker */}
        <div
          className="absolute top-0 h-full w-1 bg-yellow-400 transition-opacity duration-300"
          style={{ 
            left: `${minPercentage}%`,
            opacity: hasReachedMin ? 0.5 : 0.8
          }}
        >
          <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
            <div className="bg-yellow-400/10 backdrop-blur-sm px-2 py-1 rounded-lg">
              <div className="text-[10px] font-medium text-yellow-400 whitespace-nowrap">
                Min: ${min}
              </div>
            </div>
          </div>
        </div>

        {/* Maximum threshold marker */}
        <div
          className="absolute top-0 right-0 h-full w-1 bg-gray-400/30 transition-opacity duration-300"
        >
          <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-700/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              <div className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                Max: ${max}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current value */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className={`text-lg font-semibold ${
            hasReachedMin 
              ? 'text-green-400'
              : 'text-blue-400'
          }`}>
            ${current.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400">current balance</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
