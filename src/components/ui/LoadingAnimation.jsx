import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingAnimation = ({ text = "Loading...", onComplete = null }) => {
  // Slot machine symbols with SideBet coin
  const symbols = ['🍒', '💎', '🔔', '⭐', '7️⃣', '💰', '🎰', '🍀'];
  const sideBetCoin = '🪙'; // SideBet coin symbol
  const [isWinning, setIsWinning] = useState(false);
  const [showWin, setShowWin] = useState(false);
  
  useEffect(() => {
    // console.log('LoadingAnimation mounted, onComplete:', !!onComplete);
    // Trigger win animation after a delay
    const timer = setTimeout(() => {
      // console.log('Starting win sequence');
      setIsWinning(true);
      setTimeout(() => {
        // console.log('Showing win animation');
        setShowWin(true);
        if (onComplete) {
          setTimeout(() => {
            // console.log('Triggering onComplete');
            onComplete();
          }, 1500);
        }
      }, 500);
    }, 2500); // Start win sequence after 2.5 seconds
    
    return () => {
      // console.log('LoadingAnimation unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, []); // Remove onComplete dependency to prevent re-runs
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Lava lamp background effect */}
        <div className="absolute inset-0 -m-8">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500 rounded-full filter blur-3xl opacity-70 animate-lava-1"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-full filter blur-3xl opacity-70 animate-lava-2"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-yellow-500 rounded-full filter blur-3xl opacity-70 animate-lava-3"></div>
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-orange-600 rounded-full filter blur-3xl opacity-70 animate-lava-4"></div>
        </div>
        
        {/* Slot machine reels */}
        <div className="relative z-10 flex gap-2 mb-4">
          {[0, 1, 2].map((reelIndex) => (
            <div key={reelIndex} className="relative w-20 h-24 bg-black/80 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-lg">
              {/* Reel gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 z-10"></div>
              
              {/* Win highlight effect */}
              <AnimatePresence>
                {showWin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-b from-yellow-400/40 via-yellow-300/20 to-yellow-400/40 z-20"
                  />
                )}
              </AnimatePresence>
              
              {/* Spinning symbols */}
              <motion.div
                animate={isWinning ? {
                  y: [-960, -480] // Stop at SideBet coin position
                } : {
                  y: [0, -960, 0]
                }}
                transition={isWinning ? {
                  duration: 1 + reelIndex * 0.2,
                  ease: "easeOut",
                  delay: reelIndex * 0.1
                } : {
                  duration: 2 + reelIndex * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: reelIndex * 0.1
                }}
                className="absolute inset-0"
              >
                {/* Triple the symbols array to ensure smooth scrolling */}
                {[...symbols, sideBetCoin, ...symbols, sideBetCoin, ...symbols].map((symbol, idx) => (
                  <div
                    key={idx}
                    className="h-24 flex items-center justify-center text-4xl"
                  >
                    {symbol}
                  </div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
        
        {/* Loading text with glow effect or WIN message */}
        <AnimatePresence mode="wait">
          {!showWin ? (
            <motion.div
              key="loading"
              animate={{
                textShadow: [
                  "0 0 20px rgba(251, 146, 60, 0.8)",
                  "0 0 40px rgba(251, 146, 60, 1)",
                  "0 0 20px rgba(251, 146, 60, 0.8)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              className="text-white font-bold text-lg tracking-wider text-center"
            >
              {text}
            </motion.div>
          ) : (
            <motion.div
              key="win"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1], 
                opacity: 1,
                textShadow: [
                  "0 0 20px rgba(255, 215, 0, 0.8)",
                  "0 0 60px rgba(255, 215, 0, 1)",
                  "0 0 40px rgba(255, 215, 0, 0.8)"
                ]
              }}
              transition={{ duration: 0.5 }}
              className="text-yellow-400 font-bold text-2xl tracking-wider text-center"
            >
              JACKPOT!
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Win celebration effects */}
        <AnimatePresence>
          {showWin && (
            <>
              {/* Coin explosion */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`coin-${i}`}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ 
                    x: Math.cos(i * Math.PI / 4) * 100,
                    y: Math.sin(i * Math.PI / 4) * 100,
                    opacity: 0,
                    scale: 1.5
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 text-3xl"
                >
                  🪙
                </motion.div>
              ))}
              
              {/* Flash effect */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-yellow-400 rounded-full"
              />
            </>
          )}
        </AnimatePresence>
        
        {/* Coin animation (hide during win) */}
        {!showWin && (
          <div className="absolute -top-2 -right-2">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 1,
                  repeat: Infinity
                }
              }}
              className="text-2xl"
            >
              🪙
            </motion.div>
          </div>
        )}
        
        {/* Jackpot stars (enhanced during win) */}
        {[...Array(showWin ? 6 : 3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400"
            style={{
              top: showWin ? `${Math.random() * -50 - 20}px` : `${-10 - i * 15}px`,
              left: showWin ? `${Math.random() * 200 - 50}px` : `${20 + i * 20}px`
            }}
            animate={showWin ? {
              scale: [0, 2, 0],
              opacity: [0, 1, 0],
              rotate: [0, 360, 720],
              y: [-20, -100]
            } : {
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: showWin ? 1.5 : 2,
              repeat: showWin ? 0 : Infinity,
              delay: i * 0.1
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;