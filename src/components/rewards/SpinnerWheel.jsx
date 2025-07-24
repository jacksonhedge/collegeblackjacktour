import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { rewardsService } from '../../services/RewardsService';
import StorageService from '../../services/firebase/StorageService';

const SpinnerWheel = ({ prizes, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [totalRotation, setTotalRotation] = useState(0);
  const [platformImages, setPlatformImages] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadImages = async () => {
      const images = {};
      for (const prize of prizes) {
        try {
          const url = await StorageService.getStaticAssetUrl('platform-logos', prize.logo);
          if (url) {
            images[prize.name] = url;
          }
        } catch (error) {
          console.error(`Error loading image for ${prize.name}:`, error);
        }
      }
      setPlatformImages(images);
    };

    loadImages();
  }, [prizes]);

  const renderPlatformImage = (prize) => {
    if (platformImages[prize.name]) {
      return (
        <image
          href={platformImages[prize.name]}
          x="-15"
          y="-15"
          width="30"
          height="30"
          className="rounded-full"
        />
      );
    }
    return null;
  };

  const spin = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spinDuration = 6000; // 6 seconds
    const minSpins = 5; // Minimum number of full rotations
    const maxSpins = 10; // Maximum number of full rotations
    const randomSpins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const baseRotation = randomSpins * 360;
    const randomAngle = Math.random() * 360;
    const finalRotation = baseRotation + randomAngle;

    setTotalRotation(finalRotation);

    // Wait for the spin animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      if (onSpinComplete) {
        onSpinComplete(finalRotation);
      }
    }, spinDuration);
  }, [isSpinning, onSpinComplete]);

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="flex flex-col items-center">
      {/* Prize Key */}
      <div className="grid grid-cols-2 gap-6 mb-8 text-lg">
        {prizes.map((prize, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-700/80 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${prize.gradientStart}, ${prize.gradientEnd})` }}
              />
              <span className="flex-shrink-0 font-medium text-white">{prize.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              {platformImages[prize.name] && (
                <img
                  src={platformImages[prize.name]}
                  alt={prize.name}
                  className="w-6 h-6 rounded bg-white/10 p-1"
                />
              )}
              <span className="text-green-300 font-medium">${prize.value.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Spinner Wheel Container */}
      <div className="relative w-96 h-96">
        {/* Pointer Triangle */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 
          border-t-[32px] border-l-[16px] border-r-[16px]
          border-t-green-400 border-l-transparent border-r-transparent
          filter drop-shadow-lg z-20" />

        {/* SVG Wheel */}
        <div
          style={{
            transform: `rotate(${totalRotation}deg)`,
            transition: isSpinning ? 'transform 6s cubic-bezier(0.32, 0.94, 0.60, 1)' : 'none'
          }}
          className="absolute inset-0"
        >
          <svg
            viewBox="0 0 300 300"
            className={`w-full h-full transform ${isSpinning ? 'scale-105' : 'scale-100'} transition-transform duration-300`}
          >
            <g transform="translate(150,150)">
              {prizes.map((prize, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                const largeArcFlag = segmentAngle <= 180 ? 0 : 1;

                // Calculate points for the segment path
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);
                const x1 = 140 * Math.cos(startRad);
                const y1 = 140 * Math.sin(startRad);
                const x2 = 140 * Math.cos(endRad);
                const y2 = 140 * Math.sin(endRad);

                // Calculate text position
                const midAngle = (startAngle + endAngle) / 2;
                const midRad = (midAngle - 90) * (Math.PI / 180);
                const textX = 100 * Math.cos(midRad);
                const textY = 100 * Math.sin(midRad);
                const imageX = 70 * Math.cos(midRad);
                const imageY = 70 * Math.sin(midRad);

                return (
                  <g key={index}>
                    {/* Segment */}
                    <path
                      d={`M 0 0 L ${x1} ${y1} A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={`url(#gradient-${index})`}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:brightness-110"
                    />
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: prize.gradientStart }} />
                        <stop offset="100%" style={{ stopColor: prize.gradientEnd }} />
                      </linearGradient>
                    </defs>

                    {/* Platform Logo */}
                    <g transform={`translate(${imageX}, ${imageY})`}>
                      {renderPlatformImage(prize)}
                    </g>

                    {/* Prize Value */}
                    <g transform={`translate(${textX}, ${textY})`}>
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="white"
                        className="text-sm font-medium"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        ${prize.value.toFixed(2)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`mt-8 px-8 py-3 text-white rounded-lg font-medium transition-all duration-200
          ${isSpinning
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-green-500 hover:bg-green-600 transform hover:scale-105 shadow-lg hover:shadow-green-500/25'
          }`}
      >
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>

      {/* Decorative Elements */}
      <div className={`mt-8 text-center transition-opacity duration-300
        ${isSpinning ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-32 h-1 mx-auto rounded-full bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        <p className="mt-4 text-gray-200 text-sm">Good luck!</p>
      </div>
    </div>
  );
};

SpinnerWheel.propTypes = {
  prizes: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    logo: PropTypes.string.isRequired,
    gradientStart: PropTypes.string.isRequired,
    gradientEnd: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  })).isRequired,
  onSpinComplete: PropTypes.func.isRequired
};

export default SpinnerWheel;
