import React, { useState, useRef, useEffect } from 'react';
import { X, Coins, Lock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import PrizeKey from '../spinner/PrizeKey';

const SpinnerModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [spinnerCount, setSpinnerCount] = useState(0);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const count = parseInt(localStorage.getItem('spinnerCount') || '0');
      setSpinnerCount(count);
    }
  }, [isOpen]);

  const prizes = [
    {
      platform: 'Sportsbook',
      prize: '$0.25',
      subtitle: 'FD/DK/MGM/Caesars',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-white',
      logos: ['/images/fanduel.png', '/images/draftkings.png', '/images/caesars.png'],
      wheelColor: '#1479C0', // Blue
      wheelTextColor: '#FFFFFF',
      locked: false
    },
    {
      platform: 'Sweeps',
      prize: '$0.25',
      subtitle: 'McLuck/Pulsz/Crown',
      color: 'from-red-500 to-red-600',
      textColor: 'text-white',
      logos: ['/images/mcluck.png', '/images/pulsz.png', '/images/crowncoins.png'],
      wheelColor: '#DC2626', // Red
      wheelTextColor: '#FFFFFF',
      locked: false
    },
    {
      platform: 'Fantasy',
      prize: '$0.25',
      subtitle: 'Betr/Sleeper/League',
      color: 'from-green-500 to-green-600',
      textColor: 'text-white',
      logos: ['/images/betrFantasy.png', '/images/sleeperFantasy.png', '/images/espnFantasy.png'],
      wheelColor: '#10B981', // Green
      wheelTextColor: '#FFFFFF',
      locked: false
    },
    {
      platform: 'Bankroll',
      prize: '$10',
      subtitle: 'Subscribe to unlock',
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-white',
      logos: ['/images/BankrollLogoTransparent.png'],
      wheelColor: '#9333EA', // Purple
      wheelTextColor: '#FFFFFF',
      locked: true
    }
  ];

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    // Random spin amount (3-5 full rotations plus landing position)
    const spins = 3 + Math.random() * 2;
    const selectedIndex = Math.floor(Math.random() * prizes.length);
    const prizeAngle = (360 / prizes.length) * selectedIndex;
    const totalRotation = spins * 360 + (360 - prizeAngle);

    setRotation(prev => prev + totalRotation);

    // Show result after spin completes
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(prizes[selectedIndex]);
      
      // Decrement spinner count after spin completes
      const currentCount = parseInt(localStorage.getItem('spinnerCount') || '0');
      if (currentCount > 0) {
        localStorage.setItem('spinnerCount', (currentCount - 1).toString());
        setSpinnerCount(currentCount - 1);
      }
    }, 4000);
  };

  const handleClaimPrize = async () => {
    // Check if the prize is locked
    if (selectedPrize.locked) {
      // Show subscription message
      return;
    }
    
    // Here you would handle actually crediting the prize
    console.log('Claiming prize:', selectedPrize);
    
    // Track the prize claim
    try {
      // In a real implementation, you would save this to the database
      const prizeData = {
        userId: currentUser?.id,
        username: currentUser?.profile?.username || currentUser?.email,
        platform: selectedPrize.platform,
        prize: selectedPrize.prize,
        claimedAt: new Date().toISOString()
      };
      
      console.log('Prize claimed:', prizeData);
      
      // TODO: Send to backend to record the prize and send notification email
      // await supabase.from('spinner_prizes').insert(prizeData);
      
    } catch (error) {
      console.error('Error claiming prize:', error);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-lg ${
        isDark ? 'bg-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Daily Prize Spinner
              </h2>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                spinnerCount > 0 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-500 text-white/60'
              }`}>
                <Coins className="w-4 h-4" />
                <span className="font-bold">{spinnerCount}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Spinner Container */}
          <div className="relative w-96 h-96 mx-auto mb-8">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
              <div className="relative">
                {/* Main triangle pointing down */}
                <div className="w-0 h-0 
                  border-l-[20px] border-l-transparent
                  border-t-[35px] border-t-purple-600
                  border-r-[20px] border-r-transparent
                  filter drop-shadow-lg"
                />
                {/* Glowing effect */}
                <div className="absolute inset-0 w-0 h-0 
                  border-l-[20px] border-l-transparent
                  border-t-[35px] border-t-purple-400
                  border-r-[20px] border-r-transparent
                  animate-pulse opacity-50"
                />
              </div>
            </div>

            {/* Wheel */}
            <div className="relative w-full h-full">
              <svg
                ref={wheelRef}
                className="w-full h-full transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
                viewBox="0 0 200 200"
              >
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length);
                  const startAngle = angle * index - 90;
                  const endAngle = startAngle + angle;
                  const x1 = 100 + 95 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 95 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 95 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 95 * Math.sin((endAngle * Math.PI) / 180);
                  const midAngle = startAngle + angle / 2;
                  const textX = 100 + 65 * Math.cos((midAngle * Math.PI) / 180);
                  const textY = 100 + 65 * Math.sin((midAngle * Math.PI) / 180);

                  return (
                    <g key={index}>
                      {/* Slice */}
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                        fill={prize.wheelColor}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      {/* Lock icon for locked prizes */}
                      {prize.locked && (
                        <g transform={`translate(${100 + 40 * Math.cos((midAngle * Math.PI) / 180)}, ${100 + 40 * Math.sin((midAngle * Math.PI) / 180)})`}>
                          <rect x="-8" y="-10" width="16" height="20" fill="rgba(0,0,0,0.3)" rx="2" />
                          <text
                            x="0"
                            y="5"
                            fontSize="14"
                            fill="#FFD700"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            🔒
                          </text>
                        </g>
                      )}
                      {/* Logos Container */}
                      <g transform={`translate(${textX}, ${textY})`}>
                        {/* Prize Text - Straight */}
                        <text
                          x="0"
                          y="-15"
                          fontSize="16"
                          fontWeight="bold"
                          fill={prize.wheelTextColor}
                          textAnchor="middle"
                        >
                          {prize.prize}
                        </text>
                        {/* Logos */}
                        {prize.logos && prize.logos.length > 0 && (
                          <g>
                            {prize.logos.map((logo, logoIndex) => {
                              const logoSize = prize.logos.length === 1 ? 20 : 14;
                              const logoSpacing = prize.logos.length === 1 ? 0 : 16;
                              const xOffset = prize.logos.length === 1 ? 0 : (logoIndex - 1) * logoSpacing;
                              return (
                                <image
                                  key={logoIndex}
                                  href={logo}
                                  x={xOffset - logoSize/2}
                                  y={-5}
                                  width={logoSize}
                                  height={logoSize}
                                  preserveAspectRatio="xMidYMid meet"
                                />
                              );
                            })}
                          </g>
                        )}
                        {/* Subtitle Text - Straight */}
                        {prize.subtitle && !prize.locked && (
                          <text
                            x="0"
                            y="20"
                            fontSize="7"
                            fill={prize.wheelTextColor}
                            textAnchor="middle"
                            opacity="0.8"
                          >
                            {prize.subtitle}
                          </text>
                        )}
                      </g>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="25" fill={isDark ? '#1f2937' : '#f3f4f6'} />
                <circle cx="100" cy="100" r="20" fill={isDark ? '#374151' : '#e5e7eb'} />
              </svg>
            </div>
          </div>

          {/* Action Button */}
          {!selectedPrize ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning || spinnerCount === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSpinning || spinnerCount === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02]'
              } text-white shadow-lg`}
            >
              {isSpinning ? 'Spinning...' : spinnerCount === 0 ? 'No Spins Available' : 'SPIN TO WIN!'}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Prize Display */}
              <div className={`p-6 rounded-xl text-center ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <h3 className={`text-xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedPrize.locked ? '🔒 Locked Prize! 🔒' : '🎉 Congratulations! 🎉'}
                </h3>
                <p className={`text-lg mb-4 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedPrize.locked ? 'You found:' : 'You won:'}
                </p>
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-white'
                } shadow-md`}>
                  <img 
                    src={selectedPrize.logos[0]} 
                    alt={selectedPrize.platform}
                    className="w-8 h-8 rounded"
                  />
                  <div className="text-left">
                    <div className={`font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedPrize.platform}
                    </div>
                    <div className={`font-bold ${selectedPrize.locked ? 'text-yellow-500' : 'text-green-500'}`}>
                      {selectedPrize.prize}
                    </div>
                    {selectedPrize.subtitle && (
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedPrize.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                {selectedPrize.locked && (
                  <p className={`mt-4 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Subscribe to Bankroll+ to unlock this prize!
                  </p>
                )}
              </div>

              {/* Claim Button */}
              {selectedPrize.locked ? (
                <button
                  onClick={() => {
                    // Navigate to subscription page
                    console.log('Navigate to subscription');
                    onClose();
                  }}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg transform transition-all hover:scale-[1.02]"
                >
                  Subscribe to Unlock
                </button>
              ) : (
                <button
                  onClick={handleClaimPrize}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform transition-all hover:scale-[1.02]"
                >
                  Claim Prize
                </button>
              )}
            </div>
          )}

          {/* Info Text */}
          <p className={`text-center text-sm mt-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Spin the wheel to win amazing prizes from our partner platforms!
          </p>
          
          {/* Prize Key */}
          <PrizeKey prizes={prizes} />
        </div>
      </div>
    </div>
  );
};

export default SpinnerModal;