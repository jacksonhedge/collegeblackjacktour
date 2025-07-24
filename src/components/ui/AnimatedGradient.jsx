import React from 'react';

const AnimatedGradient = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-400 to-black animate-gradient"
        style={{
          animation: 'gradient 15s ease infinite',
          backgroundSize: '400% 400%',
        }}
      />
      <style jsx="true">{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedGradient;
