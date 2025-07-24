import React, { useState } from 'react';
import GiftCardDisplay from '../components/giftcard/GiftCardDisplay';

// Sample platform logos (using simple placeholders for demo)
const PlatformLogo = ({ platform }) => {
  const getColorByPlatform = () => {
    switch(platform.toLowerCase()) {
      case 'fanduel': return 'bg-blue-600';
      case 'draftkings': return 'bg-green-600';
      case 'betmgm': return 'bg-yellow-600';
      case 'caesars': return 'bg-purple-600';
      case 'pointsbet': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };
  
  return (
    <div className={`h-8 w-8 rounded-full ${getColorByPlatform()} flex items-center justify-center text-white font-bold text-xs`}>
      {platform.substring(0, 2).toUpperCase()}
    </div>
  );
};

const GiftCardDemo = () => {
  // Sample gift cards for demonstration
  const demoGiftCards = [
    {
      id: 1,
      type: 'Visa Debit',
      gamingBrand: 'FanDuel',
      cardNumber: '4111111111111111',
      amount: 50.00,
      expirationDate: '12/25',
      cvv: '123',
      dateAdded: new Date()
    },
    {
      id: 2,
      type: 'Mastercard Debit',
      gamingBrand: 'DraftKings',
      cardNumber: '5555555555554444',
      amount: 100.00,
      expirationDate: '10/26',
      cvv: '321',
      dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: 3,
      type: 'Visa Debit',
      gamingBrand: 'BetMGM',
      cardNumber: '4111222233334444',
      amount: 200.00,
      expirationDate: '09/27',
      cvv: '456',
      dateAdded: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    }
  ];
  
  const [giftCards] = useState(demoGiftCards);
  const [selectedCardId, setSelectedCardId] = useState(giftCards[0].id);
  
  const selectedCard = giftCards.find(card => card.id === selectedCardId);

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            Gift Card Examples
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Select a platform to see different gift card designs
          </p>
          
          {/* Platform Selector */}
          <div className="flex justify-center space-x-4 mb-12">
            {giftCards.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`p-2 rounded-lg transition-all ${
                  selectedCardId === card.id 
                    ? 'bg-purple-700 shadow-lg scale-105' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex flex-col items-center">
                  <PlatformLogo platform={card.gamingBrand} />
                  <span className="text-white text-sm mt-2">{card.gamingBrand}</span>
                  <span className="text-gray-400 text-xs">${card.amount}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Featured Gift Card */}
          <div className="transform transition-all duration-500">
            <GiftCardDisplay 
              type={selectedCard.type}
              gamingBrand={selectedCard.gamingBrand}
              platformLogo={<PlatformLogo platform={selectedCard.gamingBrand} />}
              cardNumber={selectedCard.cardNumber}
              amount={selectedCard.amount}
              expirationDate={selectedCard.expirationDate}
              cvv={selectedCard.cvv}
              dateAdded={selectedCard.dateAdded}
            />
          </div>
          
          {/* Gift Card Features Description */}
          <div className="mt-12 bg-gray-800 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Bankroll Gift Card Features</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-purple-500 flex-shrink-0 mt-1 mr-3"></div>
                <p>Animated gradient background with Bankroll brand colors</p>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-pink-500 flex-shrink-0 mt-1 mr-3"></div>
                <p>Co-branded with both Bankroll and platform logo</p>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-indigo-500 flex-shrink-0 mt-1 mr-3"></div>
                <p>Secure card details including number, expiration date and CVV</p>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex-shrink-0 mt-1 mr-3"></div>
                <p>Card provider logo (Visa, Mastercard, etc.)</p>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-green-500 flex-shrink-0 mt-1 mr-3"></div>
                <p>Premium design with subtle animations and lighting effects</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardDemo;
