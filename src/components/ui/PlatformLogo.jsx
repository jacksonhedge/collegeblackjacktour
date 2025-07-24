import React, { useState } from 'react';

/**
 * PlatformLogo component that displays platform logos with automatic fallback to initials
 * @param {Object} props - Component props
 * @param {string} props.src - Image source path
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.name - Platform name (used for initials fallback)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.gradientStart - Start color for gradient background
 * @param {string} props.gradientEnd - End color for gradient background
 */
const PlatformLogo = ({ 
  src, 
  alt, 
  name, 
  className = '', 
  gradientStart = '#6366F1',
  gradientEnd = '#4F46E5'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Generate initials from platform name
  const getInitials = (platformName) => {
    if (!platformName) return '?';
    
    // Special cases for known platforms
    const specialCases = {
      'DraftKings': 'DK',
      'FanDuel': 'FD',
      'BetMGM': 'MGM',
      'ESPN Fantasy': 'ESPN',
      'ESPN BET': 'ESPN',
      'WynnBet': 'WB',
      'BetRivers': 'BR',
      'BetRivers.Net': 'BR',
      'PokerStars': 'PS',
      'PrizePicks': 'PP',
      'McLuck': 'ML',
      'WowVegas': 'WV',
      'High 5': 'H5',
      'Crown Coins': 'CC',
      'Money Factory': 'MF',
      'Sports Millions': 'SM',
      'Fortune Wheelz': 'FW',
      'FunzCity': 'FC',
      'HelloMillions': 'HM'
    };
    
    if (specialCases[platformName]) {
      return specialCases[platformName];
    }
    
    // For other names, take first letter of each word (up to 2 letters)
    const words = platformName.split(' ');
    if (words.length === 1) {
      // Single word - take first 2 letters
      return platformName.substring(0, 2).toUpperCase();
    } else {
      // Multiple words - take first letter of each word (max 2)
      return words
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // If image failed to load or no src provided, show initials
  if (imageError || !src) {
    const initials = getInitials(name || alt);
    
    return (
      <div 
        className={`flex items-center justify-center text-white font-bold ${className}`}
        style={{
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          borderRadius: '0.5rem'
        }}
      >
        <span className="text-xs sm:text-sm md:text-base select-none">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div 
          className={`flex items-center justify-center ${className}`}
          style={{
            background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
            borderRadius: '0.5rem'
          }}
        >
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt || name}
        className={`${className} ${imageLoading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </>
  );
};

export default PlatformLogo;