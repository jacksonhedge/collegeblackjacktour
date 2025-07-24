import React from 'react';
import VisaLogo from './VisaLogo';
import MastercardLogo from './MastercardLogo';
import TappppLogo from './TappppLogo';

// Define the Bankroll logo path 
const BANKROLL_LOGO = '/images/BankrollLogoTransparent.png';

const GiftCardDisplay = ({ 
  type = "Visa Debit",
  gamingBrand = "FanDuel",
  platformLogo = null, // New prop for the platform logo
  cardNumber = "4111111111111111",
  amount = 20.00,
  expirationDate = "12/25",
  cvv = "123",
  dateAdded = new Date()
}) => {
  // Format card number with spaces every 4 digits
  const formattedCardNumber = cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
  const formattedDate = dateAdded instanceof Date 
    ? dateAdded.toLocaleDateString()
    : new Date(dateAdded.seconds * 1000).toLocaleDateString();

  const getCardLogo = () => {
    switch (type) {
      case 'Visa Debit':
        return <VisaLogo className="h-8 w-auto" />;
      case 'Mastercard Debit':
        return <MastercardLogo className="h-8 w-auto" />;
      case 'Tapppp Debit':
        return <TappppLogo className="h-8 w-auto" />;
      default:
        return null;
    }
  };

  // Get platform-specific accent color for light effects
  const getPlatformAccentColor = (brand) => {
    switch(brand.toLowerCase()) {
      case 'fanduel':
        return 'rgba(0, 120, 215, 0.6)'; // Blue
      case 'draftkings':
        return 'rgba(0, 135, 62, 0.6)'; // Green
      case 'betmgm':
        return 'rgba(241, 196, 15, 0.6)'; // Yellow
      case 'caesars':
        return 'rgba(212, 175, 55, 0.6)'; // Gold
      case 'pointsbet': 
        return 'rgba(231, 76, 60, 0.6)'; // Red
      case 'barstool':
        return 'rgba(44, 62, 80, 0.6)'; // Dark gray
      case 'underdog':
        return 'rgba(230, 126, 34, 0.6)'; // Orange
      default:
        return 'rgba(147, 51, 234, 0.6)'; // Purple (Bankroll)
    }
  };

  // Generate dynamic gradient based on platform brand
  const getDynamicGradient = (brand) => {
    // Default Bankroll gradient
    const defaultGradient = 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(192, 38, 211, 0.8), rgba(219, 39, 119, 0.7), rgba(124, 58, 237, 0.9))';
    
    // Platform-specific gradients
    switch(brand.toLowerCase()) {
      case 'fanduel':
        // FanDuel (blue/light blue + Bankroll purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(0, 120, 215, 0.8), rgba(3, 169, 244, 0.8), rgba(124, 58, 237, 0.9))';
      
      case 'draftkings':
        // DraftKings (green + Bankroll purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(0, 135, 62, 0.8), rgba(46, 204, 113, 0.8), rgba(124, 58, 237, 0.9))';
      
      case 'betmgm':
        // BetMGM (gold/yellow + Bankroll purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(241, 196, 15, 0.8), rgba(243, 156, 18, 0.8), rgba(124, 58, 237, 0.9))';
      
      case 'caesars':
        // Caesars (gold + dark purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(212, 175, 55, 0.8), rgba(102, 51, 153, 0.8), rgba(124, 58, 237, 0.9))';
      
      case 'pointsbet':
        // PointsBet (red + Bankroll purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(231, 76, 60, 0.8), rgba(192, 57, 43, 0.8), rgba(124, 58, 237, 0.9))';
      
      case 'barstool':
        // Barstool (black/dark gray + Bankroll purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(44, 62, 80, 0.8), rgba(52, 73, 94, 0.8), rgba(124, 58, 237, 0.9))';
      
      case 'underdog':
        // Underdog (orange + Bankroll purple)
        return 'linear-gradient(125deg, rgba(147, 51, 234, 0.9), rgba(230, 126, 34, 0.8), rgba(243, 156, 18, 0.8), rgba(124, 58, 237, 0.9))';
        
      default:
        return defaultGradient;
    }
  };

  // Mock platform logo if none provided (for demo)
  const renderPlatformLogo = () => {
    if (platformLogo) return platformLogo;
    
    // Return appropriate demo logo based on gaming brand
    if (gamingBrand === "FanDuel") {
      return (
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
          FD
        </div>
      );
    } else if (gamingBrand === "DraftKings") {
      return (
        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">
          DK
        </div>
      );
    } else {
      return (
        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xs">
          {gamingBrand.substring(0, 2).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="relative bg-purple-900 rounded-xl overflow-hidden shadow-xl h-64">
        {/* Enhanced gradient background with Bankroll colors */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              animation: 'gradient 8s ease infinite',
              backgroundSize: '400% 400%',
              backgroundImage: getDynamicGradient(gamingBrand)
            }}
          />
          
          {/* Enhanced lava lamp lights effect */}
          <div className="absolute inset-0 opacity-30 overflow-hidden">
            {/* Primary lights */}
            <div 
              className="absolute h-64 w-64 rounded-full bg-white blur-3xl -top-20 -left-20" 
              style={{
                animation: 'slow-pulse 6s ease-in-out infinite',
                filter: 'blur(40px)'
              }} 
            />
            <div 
              className="absolute h-64 w-64 rounded-full bg-purple-300 blur-3xl -bottom-20 -right-20" 
              style={{
                animation: 'slow-pulse 8s ease-in-out infinite',
                filter: 'blur(40px)',
                animationDelay: '2s'
              }} 
            />
            
            {/* Secondary lights based on platform */}
            <div 
              className="absolute h-32 w-32 rounded-full blur-3xl top-40 right-10" 
              style={{
                animation: 'slow-pulse 7s ease-in-out infinite',
                filter: 'blur(30px)',
                animationDelay: '1s',
                background: getPlatformAccentColor(gamingBrand)
              }} 
            />
            <div 
              className="absolute h-24 w-24 rounded-full blur-3xl bottom-10 left-20" 
              style={{
                animation: 'slow-pulse 5s ease-in-out infinite',
                filter: 'blur(30px)',
                animationDelay: '3s',
                background: 'rgba(255, 255, 255, 0.3)'
              }} 
            />
          </div>
          
          {/* Centered Bankroll Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ opacity: 0.08, transform: 'rotate(8deg)', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>
              <img 
                src={BANKROLL_LOGO}
                alt="Bankroll Logo" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Card Header */}
        <div className="px-6 pt-6 pb-3 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Platform Logo - Moved to top left */}
              {renderPlatformLogo()}
            </div>
            
            <div className="flex items-center">
              {/* "GIFT CARD" text */}
              <div className="flex flex-col items-end mr-2">
                <div className="text-white text-sm font-semibold">
                  BANKROLL
                </div>
                <div className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent text-xs font-bold">
                  GIFT CARD
                </div>
              </div>
              
              {/* Bankroll Logo - Moved to top right */}
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                <img 
                  src={BANKROLL_LOGO}
                  alt="Bankroll" 
                  className="h-8 w-8 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 relative z-10">
          {/* Gaming Brand - Made more prominent */}
          <div className="mb-4">
            <div className="text-gray-300 text-xs mb-1">Platform</div>
            <div className="text-white text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              {gamingBrand}
            </div>
          </div>
          
          {/* Card Number */}
          <div className="mb-3">
            <div className="text-gray-300 text-xs mb-1">Card Number</div>
            <div className="text-white text-lg font-mono tracking-wider">
              {formattedCardNumber}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <div className="text-gray-300 text-xs mb-1">Amount</div>
            <div className="text-white text-2xl font-bold">
              ${amount.toFixed(2)}
            </div>
          </div>

          {/* Footer Details */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-gray-300 text-xs mb-1">Valid Thru</div>
              <div className="text-white font-mono">
                {expirationDate}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-xs mb-1">CVV</div>
              <div className="text-white font-mono">
                {cvv}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-xs mb-1">Added</div>
              <div className="text-white text-sm">
                {formattedDate}
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8">
                {getCardLogo()}
              </div>
            </div>
          </div>
          
          {/* Card Bottom Border - Decorative Element */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400"></div>
        </div>
      </div>
      
      {/* Add keyframes for lava lamp effect */}
      <style jsx="true">{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 25%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 75%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slow-pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default GiftCardDisplay;
