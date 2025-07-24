import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

const DEFAULT_LOGO = '/images/BankrollLogoTransparent.png';

const SyncingLogos = () => {
  return (
    <div className="relative py-12">
      {/* Main glowing background */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-purple-500/10 to-transparent"></div>
      
      <div className="relative flex items-center justify-center space-x-16">
        {/* Bankroll Logo Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/30 via-purple-500/20 to-transparent rounded-full animate-pulse"></div>
          <div className="w-56 h-56 relative flex items-center justify-center bg-gray-900/50 rounded-full p-6">
            <img
              src={DEFAULT_LOGO}
              alt="Bankroll"
              className="w-full h-full object-contain relative z-10"
            />
          </div>
          {/* Connecting line left */}
          <div className="absolute top-1/2 right-0 h-0.5 w-16 translate-x-full">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Center Sync Icon */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full"></div>
          <div className="relative bg-gray-900/50 p-6 rounded-full">
            <ArrowLeftRight 
              className="h-12 w-12 text-purple-400 animate-sync-spin" 
            />
          </div>
        </div>
        
        {/* ESPN Logo Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/30 via-purple-500/20 to-transparent rounded-full animate-pulse"></div>
          <div className="w-56 h-56 relative flex items-center justify-center bg-gray-900/50 rounded-full p-6">
            <img
              src="/images/betespn.png"
              alt="ESPN"
              className="w-full h-full object-contain relative z-10"
            />
          </div>
          {/* Connecting line right */}
          <div className="absolute top-1/2 left-0 h-0.5 w-16 -translate-x-full">
            <div className="absolute inset-0 bg-gradient-to-l from-purple-500 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Additional decorative elements */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-purple-500/5 to-transparent animate-pulse"></div>
    </div>
  );
};

export default SyncingLogos;
