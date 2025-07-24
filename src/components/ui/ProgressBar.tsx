import React from 'react';

interface ProgressBarProps {
  current: number;
  min: number;
  max: number;
  className?: string;
  startAmount?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, min, max, startAmount = 0, className = '' }) => {
  const percentage = Math.min(Math.max(((current - startAmount) / (max - startAmount)) * 100, 0), 100);
  const minPercentage = ((min - startAmount) / (max - startAmount)) * 100;
  const isComplete = current >= max;
  const hasReachedMin = current >= min;

  return (
    <div className={`w-full ${className}`}>
      <div 
        className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={startAmount}
        aria-valuemax={max}
        aria-valuenow={current}
      >
        {/* Background pulse animation when complete */}
        {isComplete && (
          <div className="absolute inset-0 bg-green-400/20 animate-pulse rounded-full" />
        )}

        {/* Progress fill */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out rounded-full ${
            isComplete 
              ? 'bg-gradient-to-r from-green-400 to-green-500 animate-pulse'
              : hasReachedMin 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}
          style={{ 
            width: `${percentage}%`,
            boxShadow: isComplete ? '0 0 12px rgba(34, 197, 94, 0.4)' : undefined
          }}
        />
        
        {/* Start amount marker */}
        {startAmount > 0 && (
          <div
            className="absolute top-0 h-full w-1 bg-gray-400/50 transition-opacity duration-300"
            style={{ left: '0%' }}
          >
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-700/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                <div className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                  ${startAmount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maximum threshold marker */}
        <div
          className={`absolute top-0 right-0 h-full w-1 transition-opacity duration-300 ${
            isComplete ? 'bg-green-400/50' : 'bg-gray-400/30'
          }`}
        >
          <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
            <div className={`backdrop-blur-sm px-2 py-1 rounded-lg ${
              isComplete ? 'bg-green-900/80' : 'bg-gray-700/80'
            }`}>
              <div className={`text-[10px] font-medium whitespace-nowrap ${
                isComplete ? 'text-green-400' : 'text-gray-400'
              }`}>
                ${max}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current value */}
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className={`text-lg font-semibold ${
            isComplete 
              ? 'text-green-400'
              : hasReachedMin 
                ? 'text-blue-400'
                : 'text-gray-400'
          }`}>
            ${current.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400">current balance</span>
          {isComplete && (
            <span className="text-sm text-green-400 font-medium">
              (Complete!)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
