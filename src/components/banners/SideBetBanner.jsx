import React, { useState } from 'react';
import { DollarSign, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SideBetBanner = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentJackpot] = useState(12345); // This would come from API
  const { isDark } = useTheme();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-lg p-3 md:p-4 h-32 md:h-36 
        bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md
        transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer`}
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(6)].map((_, i) => (
          <Sparkles
            key={i}
            className={`absolute h-4 w-4 animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium opacity-90">SideBet Jackpot</h3>
            <div className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`}>
              <DollarSign className="h-4 w-4 opacity-80" />
            </div>
          </div>
          
          {/* Main content */}
          <div className="space-y-1">
            <div className="text-2xl md:text-3xl font-bold">
              ${currentJackpot.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm font-medium opacity-90">
              Round-up to win big!
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-300" />
              <span className="text-[10px] md:text-xs text-green-300">
                Growing every second
              </span>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-[10px] md:text-xs opacity-70">
            Spare change lottery
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full transition-colors">
            <span>Learn More</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : ''
      }`} />
    </div>
  );
};

export default SideBetBanner;