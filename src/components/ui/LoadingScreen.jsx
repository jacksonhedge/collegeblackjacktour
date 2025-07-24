import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingAnimation from './LoadingAnimation';

const LoadingScreen = ({ isLoading, onLoadingComplete }) => {
  const [showVideo, setShowVideo] = useState(false); // Disable video
  const [loadingMessage, setLoadingMessage] = useState('Initializing Bankroll...');
  const [triggerWin, setTriggerWin] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      // console.log(`LoadingScreen render count: ${newCount}, isLoading: ${isLoading}`);
      return newCount;
    });
  }, []);
  
  const loadingMessages = [
    'Initializing Bankroll...',
    'Setting up your wallet...',
    'Loading your profile...',
    'Spinning the reels...',
    'Almost ready...'
  ];

  useEffect(() => {
    // Hide video after 2 seconds
    const videoTimer = setTimeout(() => {
      setShowVideo(false);
    }, 2000);

    // Cycle through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1500);

    return () => {
      clearTimeout(videoTimer);
      clearInterval(messageInterval);
    };
  }, []);

  if (!isLoading) {
    // console.log('LoadingScreen hiding - isLoading is false');
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        {/* Video Intro */}
        <AnimatePresence mode="wait">
          {showVideo ? (
            <motion.div
              key="video"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <video
                autoPlay
                muted
                playsInline
                className="w-64 h-64 object-cover rounded-lg"
                onEnded={() => setShowVideo(false)}
                onError={() => setShowVideo(false)} // Hide video on error
              >
                <source src="/videos/bankroll-intro.mp4" type="video/mp4" />
              </video>
              {/* Fallback animated logo while video loads or if it fails */}
              <div className="absolute inset-0 w-64 h-64 flex items-center justify-center bg-black rounded-lg -z-10">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="text-6xl"
                >
                  🎰
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <LoadingAnimation 
                key="loading-animation" // Add key to prevent remounting
                text={loadingMessage} 
                onComplete={() => {
                  // console.log('LoadingAnimation onComplete triggered');
                  if (onLoadingComplete) {
                    setTimeout(() => {
                      // console.log('Calling onLoadingComplete');
                      onLoadingComplete();
                    }, 500);
                  }
                }}
              />
              
              {/* Bankroll Logo */}
              <motion.h1 
                className="text-4xl font-bold text-white mt-8 mb-4"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  textShadow: [
                    "0 0 20px rgba(251, 146, 60, 0.8)",
                    "0 0 40px rgba(251, 146, 60, 1)",
                    "0 0 20px rgba(251, 146, 60, 0.8)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Bankroll
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;