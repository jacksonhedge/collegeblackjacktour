import React from 'react';

const AnimatedGradientBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {/* Primary animated gradient with hardware acceleration */}
      <div 
        className="absolute inset-0 w-full h-full bg-[size:150%_150%] animate-gradient bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 opacity-90"
        style={{ transform: 'translateZ(0)' }}  // Hardware acceleration
      />
      
      {/* Subtle static gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/10 to-blue-900/10"
        style={{ transform: 'translateZ(0)' }}  // Hardware acceleration
      />
      
      {/* Static vignette effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/50"
        style={{ transform: 'translateZ(0)' }}  // Hardware acceleration
      />
    </div>
  );
};

export default AnimatedGradientBackground;
