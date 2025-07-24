import React, { useState } from 'react';
import GiftCardDisplay from '../giftcard/GiftCardDisplay';
import { Download, Copy, Check } from 'lucide-react';

// Use actual platform logos
// Export for reuse in other components
export const PlatformLogo = ({ platform }) => {
  const getPlatformLogo = () => {
    switch(platform.toLowerCase()) {
      case 'fanduel': return '/images/fanduel.png';
      case 'draftkings': return '/images/draftkings.png';
      case 'betmgm': return '/images/betmgm.png';
      case 'caesars': return '/images/caesars.png';
      case 'pointsbet': return null; // Will use fallback
      case 'espn': 
      case 'espnbet': return '/images/espnBet.png';
      case 'underdog': return '/images/underdog.jpeg';
      case 'mcluck': return '/images/mcluck.png';
      case 'pulsz': return '/images/pulsz.png';
      case 'prizepicks': return '/images/prizepicks.png';
      case 'fanatics': return '/images/fanatics.png';
      case 'betr': return '/images/betr.png';
      default: return null;
    }
  };
  
  const logoPath = getPlatformLogo();
  
  // If logo is available, use it
  if (logoPath) {
    return (
      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
        <img 
          src={logoPath} 
          alt={platform}
          className="h-8 w-8 object-contain"
        />
      </div>
    );
  } 
  
  // Fallback to the colored circle with initials
  const getColorByPlatform = () => {
    switch(platform.toLowerCase()) {
      case 'fanduel': return 'bg-blue-600';
      case 'draftkings': return 'bg-green-600';
      case 'betmgm': return 'bg-yellow-600';
      case 'caesars': return 'bg-purple-600';
      case 'pointsbet': return 'bg-red-600';
      case 'espn': 
      case 'espnbet': return 'bg-red-700';
      case 'underdog': return 'bg-orange-600';
      case 'mcluck': return 'bg-pink-600';
      case 'pulsz': return 'bg-indigo-600';
      case 'prizepicks': return 'bg-blue-400';
      case 'fanatics': return 'bg-blue-800';
      case 'betr': return 'bg-orange-400';
      default: return 'bg-gray-600';
    }
  };
  
  return (
    <div className={`h-8 w-8 rounded-full ${getColorByPlatform()} flex items-center justify-center text-white font-bold text-xs`}>
      {platform.substring(0, 2).toUpperCase()}
    </div>
  );
};

const GiftCardDesigns = () => {
  // Sample gift cards for all supported platforms
  // Adding more FanDuel card variants with different values
  const platformCards = [
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
      id: 8,
      type: 'Mastercard Debit',
      gamingBrand: 'FanDuel',
      cardNumber: '5555111122223333',
      amount: 100.00,
      expirationDate: '09/24',
      cvv: '789',
      dateAdded: new Date()
    },
    {
      id: 9,
      type: 'Visa Debit',
      gamingBrand: 'FanDuel',
      cardNumber: '4111444455556666',
      amount: 200.00,
      expirationDate: '03/26',
      cvv: '456',
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
      dateAdded: new Date()
    },
    {
      id: 3,
      type: 'Visa Debit',
      gamingBrand: 'BetMGM',
      cardNumber: '4111222233334444',
      amount: 200.00,
      expirationDate: '09/27',
      cvv: '456',
      dateAdded: new Date()
    },
    {
      id: 4,
      type: 'Mastercard Debit',
      gamingBrand: 'Caesars',
      cardNumber: '5555666677778888',
      amount: 50.00,
      expirationDate: '11/25',
      cvv: '789',
      dateAdded: new Date()
    },
    {
      id: 5,
      type: 'Visa Debit',
      gamingBrand: 'PointsBet',
      cardNumber: '4111888899990000',
      amount: 75.00,
      expirationDate: '08/26',
      cvv: '567',
      dateAdded: new Date()
    },
    {
      id: 6,
      type: 'Mastercard Debit',
      gamingBrand: 'ESPN',
      cardNumber: '5555444433332222',
      amount: 125.00,
      expirationDate: '07/27',
      cvv: '234',
      dateAdded: new Date()
    },
    {
      id: 7,
      type: 'Visa Debit',
      gamingBrand: 'Underdog',
      cardNumber: '4111777766665555',
      amount: 150.00,
      expirationDate: '06/26',
      cvv: '890',
      dateAdded: new Date()
    }
  ];
  
  const [selectedCardId, setSelectedCardId] = useState(platformCards[0].id);
  const [copiedInfo, setCopiedInfo] = useState(null);
  
  const selectedCard = platformCards.find(card => card.id === selectedCardId);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedInfo(field);
    setTimeout(() => setCopiedInfo(null), 2000);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gift Card Designs</h2>
          <p className="text-gray-500 mt-1">Customize and preview gift cards for supported platforms</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
          <Download className="h-4 w-4 mr-2" />
          Export All Designs
        </button>
      </div>
      
      {/* FanDuel Highlight */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden mr-2">
            <img 
              src="/images/fanduel.png" 
              alt="FanDuel"
              className="h-6 w-6 object-contain"
            />
          </div>
          <h3 className="text-lg font-bold text-blue-800">FanDuel Gift Cards</h3>
        </div>
        <p className="text-blue-700">
          FanDuel gift cards are our most popular offering. Available in $50, $100, and $200 denominations with both Visa and Mastercard options.
        </p>
      </div>
      
      {/* Platform Card Selection */}
      <div className="mb-8">
        <h3 className="text-gray-700 font-medium mb-3">Select Card</h3>
        
        {/* FanDuel Cards (Highlighted) */}
        <div className="mb-4">
          <h4 className="text-blue-700 font-medium text-sm border-b border-blue-100 pb-2 mb-3">FanDuel Cards</h4>
          <div className="flex flex-wrap gap-3">
            {platformCards
              .filter(card => card.gamingBrand === 'FanDuel')
              .map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    selectedCardId === card.id 
                      ? 'border-blue-500 bg-blue-50 shadow' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <PlatformLogo platform={card.gamingBrand} />
                    <div className="flex flex-col items-start">
                      <span className={selectedCardId === card.id ? 'font-medium text-blue-700' : 'text-gray-700'}>
                        ${card.amount}
                      </span>
                      <span className="text-xs text-gray-500">
                        {card.type}
                      </span>
                    </div>
                  </div>
                </button>
            ))}
          </div>
        </div>
        
        {/* Other Platforms */}
        <div>
          <h4 className="text-gray-700 font-medium text-sm border-b border-gray-100 pb-2 mb-3">Other Platforms</h4>
          <div className="flex flex-wrap gap-3">
            {platformCards
              .filter(card => card.gamingBrand !== 'FanDuel')
              .map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    selectedCardId === card.id 
                      ? 'border-indigo-500 bg-indigo-50 shadow' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <PlatformLogo platform={card.gamingBrand} />
                    <div className="flex flex-col items-start">
                      <span className={selectedCardId === card.id ? 'font-medium text-indigo-700' : 'text-gray-700'}>
                        {card.gamingBrand}
                      </span>
                      <span className="text-xs text-gray-500">
                        ${card.amount}
                      </span>
                    </div>
                  </div>
                </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gift Card Preview */}
        <div>
          <h3 className="text-gray-700 font-medium mb-4">Card Preview</h3>
          <div className="border rounded-xl p-4 bg-gray-50">
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
        </div>
        
        {/* Card Details */}
        <div>
          <h3 className="text-gray-700 font-medium mb-4">Card Details</h3>
          <div className="bg-gray-50 border rounded-xl p-6 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Platform</div>
              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-800 flex items-center gap-2">
                  <PlatformLogo platform={selectedCard.gamingBrand} />
                  {selectedCard.gamingBrand}
                </div>
                <button 
                  onClick={() => handleCopy(selectedCard.gamingBrand, 'platform')} 
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {copiedInfo === 'platform' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Card Number</div>
              <div className="flex justify-between items-center">
                <div className="font-mono text-gray-800">
                  {selectedCard.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                </div>
                <button 
                  onClick={() => handleCopy(selectedCard.cardNumber, 'cardNumber')} 
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {copiedInfo === 'cardNumber' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Expiration</div>
                <div className="flex justify-between items-center">
                  <div className="font-mono text-gray-800">
                    {selectedCard.expirationDate}
                  </div>
                  <button 
                    onClick={() => handleCopy(selectedCard.expirationDate, 'expiration')} 
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copiedInfo === 'expiration' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">CVV</div>
                <div className="flex justify-between items-center">
                  <div className="font-mono text-gray-800">
                    {selectedCard.cvv}
                  </div>
                  <button 
                    onClick={() => handleCopy(selectedCard.cvv, 'cvv')} 
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copiedInfo === 'cvv' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Amount</div>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-800">
                    ${selectedCard.amount.toFixed(2)}
                  </div>
                  <button 
                    onClick={() => handleCopy(selectedCard.amount.toFixed(2), 'amount')} 
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copiedInfo === 'amount' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-sm text-gray-500 mb-1">Card Type</div>
              <div className="flex justify-between items-center">
                <div className="text-gray-800">
                  {selectedCard.type}
                </div>
                <button 
                  onClick={() => handleCopy(selectedCard.type, 'type')} 
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {copiedInfo === 'type' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <button className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                Issue This Gift Card
              </button>
              <div className="text-center text-xs text-gray-500 mt-2">
                Cards are issued immediately and cannot be reversed
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Guide */}
      <div className="mt-8 bg-gray-50 border rounded-xl p-6">
        <h3 className="text-gray-700 font-medium mb-3">Gift Card Usage Guide</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold mr-3 mt-0.5">1</div>
            <div>
              <h4 className="font-medium text-gray-800">Select a Platform</h4>
              <p className="text-gray-600">Choose the gaming platform for which you want to issue a gift card</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold mr-3 mt-0.5">2</div>
            <div>
              <h4 className="font-medium text-gray-800">Review Card Design</h4>
              <p className="text-gray-600">Confirm the design matches Bankroll branding and platform requirements</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold mr-3 mt-0.5">3</div>
            <div>
              <h4 className="font-medium text-gray-800">Issue Gift Card</h4>
              <p className="text-gray-600">Click "Issue Gift Card" and verify all details before confirming</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold mr-3 mt-0.5">4</div>
            <div>
              <h4 className="font-medium text-gray-800">Notify User</h4>
              <p className="text-gray-600">The user will receive a notification and can view their gift card in their account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardDesigns;