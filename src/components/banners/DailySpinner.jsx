import React, { useState, useEffect } from 'react';
import { Gift, Clock, ChevronRight, Coins } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePostHog } from '../../contexts/PostHogContext';

const DailySpinner = ({ onClick }) => {
  const { isDark } = useTheme();
  const { trackEvent, trackButtonClick, trackFeatureUsage } = usePostHog();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [spinnerCount, setSpinnerCount] = useState(0);

  useEffect(() => {
    // Initialize spinner count if not set
    const storedCount = localStorage.getItem('spinnerCount');
    if (!storedCount) {
      localStorage.setItem('spinnerCount', '5');
      setSpinnerCount(5);
    } else {
      setSpinnerCount(parseInt(storedCount));
    }

    const checkSpinnerAvailability = () => {
      const currentCount = parseInt(localStorage.getItem('spinnerCount') || '0');
      setSpinnerCount(currentCount);
      
      if (currentCount > 0) {
        setIsAvailable(true);
        setTimeLeft(null);
      } else {
        // Check for daily reset
        const lastResetTime = localStorage.getItem('lastSpinnerReset');
        const now = Date.now();
        
        if (!lastResetTime) {
          // First time, give daily spin
          localStorage.setItem('spinnerCount', '1');
          localStorage.setItem('lastSpinnerReset', now.toString());
          setSpinnerCount(1);
          setIsAvailable(true);
          return;
        }

        const timeSinceReset = now - parseInt(lastResetTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (timeSinceReset >= twentyFourHours) {
          // Reset daily spin
          localStorage.setItem('spinnerCount', '1');
          localStorage.setItem('lastSpinnerReset', now.toString());
          setSpinnerCount(1);
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
          const remainingTime = twentyFourHours - timeSinceReset;
          setTimeLeft(remainingTime);
        }
      }
    };

    checkSpinnerAvailability();
    const interval = setInterval(checkSpinnerAvailability, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (milliseconds) => {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleClick = () => {
    if (isAvailable && onClick && spinnerCount > 0) {
      trackButtonClick('daily_spinner', { 
        spins_available: spinnerCount,
        from_banner: true 
      });
      trackFeatureUsage('daily_spinner', { 
        spins_available: spinnerCount,
        clicked_when: 'available' 
      });
      onClick();
      // Don't decrement here, let the modal handle it after claiming
    } else if (!isAvailable) {
      trackEvent('daily_spinner_clicked_unavailable', {
        time_left: timeLeft,
        spins_available: spinnerCount
      });
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-6 h-full cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
        isAvailable 
          ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500' 
          : isDark 
            ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
            : 'bg-gradient-to-br from-gray-300 to-gray-400'
      }`}
      onClick={handleClick}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                isAvailable ? 'bg-white' : 'bg-gray-600'
              } opacity-30 animate-pulse`}
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${
            isAvailable 
              ? 'bg-white/20 backdrop-blur' 
              : 'bg-gray-500/20'
          }`}>
            <Gift className={`w-6 h-6 ${
              isAvailable ? 'text-white' : 'text-gray-300'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            {/* Spinner Count Badge */}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              spinnerCount > 0 
                ? 'bg-white/20 backdrop-blur text-white' 
                : 'bg-gray-500/20 text-white/60'
            }`}>
              <Coins className="w-4 h-4" />
              <span className="font-bold">{spinnerCount}</span>
            </div>
            {!isAvailable && timeLeft && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTimeLeft(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            Daily Spinner
          </h3>
          <p className={`text-sm ${
            isAvailable ? 'text-white/90' : 'text-white/70'
          }`}>
            {isAvailable 
              ? 'Spin to win amazing rewards!' 
              : 'Come back later for your daily spin'
            }
          </p>
        </div>

        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm ${
            isAvailable ? 'text-white/80' : 'text-white/60'
          }`}>
            <span className="text-lg">🎁</span>
            <span>Win up to $50 in rewards</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${
            isAvailable ? 'text-white/80' : 'text-white/60'
          }`}>
            <span className="text-lg">🎯</span>
            <span>Platform credits & bonuses</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${
            isAvailable ? 'text-white/80' : 'text-white/60'
          }`}>
            <span className="text-lg">🏆</span>
            <span>Exclusive VIP perks</span>
          </div>
        </div>

        <div className={`mt-6 flex items-center justify-between p-3 rounded-xl ${
          isAvailable 
            ? 'bg-white/20 backdrop-blur' 
            : 'bg-gray-500/20'
        }`}>
          <span className={`font-semibold ${
            isAvailable ? 'text-white' : 'text-white/70'
          }`}>
            {isAvailable ? 'Spin Now!' : 'Recharging...'}
          </span>
          <ChevronRight className={`w-5 h-5 ${
            isAvailable 
              ? 'text-white animate-pulse' 
              : 'text-white/50'
          }`} />
        </div>
      </div>

      {/* Shimmer effect when available */}
      {isAvailable && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
    </div>
  );
};

export default DailySpinner;