import React from 'react';
import { Loader2 } from 'lucide-react';

const WelcomeLoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="text-center space-y-6">
        <img
          src="/images/BankrollLogoTransparent.png"
          alt="Bankroll"
          className="w-32 h-32 mx-auto object-contain animate-pulse"
        />
        <h2 className="text-3xl font-bold text-white">Welcome to Bankroll</h2>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          <p className="text-gray-400">Setting up your account...</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeLoadingScreen;
