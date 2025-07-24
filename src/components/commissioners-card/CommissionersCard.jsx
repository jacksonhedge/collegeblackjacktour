import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './CommissionersCard.css';

const CommissionersCard = ({ 
  userName = "John Doe",
  cardNumber = "4242424242424242",
  expiryDate = "12/28",
  cvv = "123",
  defaultSuit = "spade",
  defaultPlatform = "sleeper"
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSuit, setSelectedSuit] = useState(defaultSuit);
  const [selectedPlatform, setSelectedPlatform] = useState(defaultPlatform);
  const [showNumber, setShowNumber] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  // Format card number for display
  const formatCardNumber = (number, show) => {
    if (!show) {
      return "•••• •••• •••• " + number.slice(-4);
    }
    return number.match(/.{1,4}/g)?.join(' ') || number;
  };

  // Get suit symbol
  const getSuitSymbol = (suit) => {
    const symbols = {
      spade: '♠',
      heart: '♥',
      diamond: '♦',
      club: '♣'
    };
    return symbols[suit] || symbols.spade;
  };

  // Get platform logo
  const getPlatformLogo = (platform) => {
    const logos = {
      sleeper: '/images/sleeperFantasy.png',
      espn: '/images/espnFantasy.png',
      yahoo: '/images/yahoofantasy.png'
    };
    return logos[platform] || logos.sleeper;
  };

  const handleCardClick = (e) => {
    // Only flip if not clicking on interactive elements
    if (!e.target.closest('.interactive-element')) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="commissioners-card-container">
      {/* Suit Selector */}
      <div className="suit-selector">
        <button
          className={`suit-btn ${selectedSuit === 'spade' ? 'active' : ''}`}
          onClick={() => setSelectedSuit('spade')}
        >
          ♠
        </button>
        <button
          className={`suit-btn ${selectedSuit === 'heart' ? 'active' : ''}`}
          onClick={() => setSelectedSuit('heart')}
        >
          ♥
        </button>
        <button
          className={`suit-btn ${selectedSuit === 'diamond' ? 'active' : ''}`}
          onClick={() => setSelectedSuit('diamond')}
        >
          ♦
        </button>
        <button
          className={`suit-btn ${selectedSuit === 'club' ? 'active' : ''}`}
          onClick={() => setSelectedSuit('club')}
        >
          ♣
        </button>
      </div>

      {/* Platform Selector */}
      <div className="platform-selector">
        <button
          className={`platform-btn ${selectedPlatform === 'sleeper' ? 'active' : ''}`}
          onClick={() => setSelectedPlatform('sleeper')}
        >
          Sleeper
        </button>
        <button
          className={`platform-btn ${selectedPlatform === 'espn' ? 'active' : ''}`}
          onClick={() => setSelectedPlatform('espn')}
        >
          ESPN
        </button>
        <button
          className={`platform-btn ${selectedPlatform === 'yahoo' ? 'active' : ''}`}
          onClick={() => setSelectedPlatform('yahoo')}
        >
          Yahoo
        </button>
      </div>

      {/* Card */}
      <div 
        className={`commissioners-card ${isFlipped ? 'flipped' : ''} ${selectedSuit}`}
        onClick={handleCardClick}
      >
        {/* Front Side */}
        <div className="card-face card-front">
          <div className="card-shimmer"></div>
          <div className="card-content">
            {/* Header */}
            <div className="card-header">
              <div className="card-brand">
                <h3 className="brand-name">BANKROLL</h3>
                <p className="card-type">Commissioners</p>
              </div>
              <img 
                src={getPlatformLogo(selectedPlatform)}
                alt={selectedPlatform}
                className="platform-logo"
              />
            </div>

            {/* Center Suit */}
            <div className="center-suit">
              {getSuitSymbol(selectedSuit)}
            </div>

            {/* Removed card number from front - now only on back */}

            {/* Footer */}
            <div className="card-footer">
              <div className="cardholder-info">
                <p className="cardholder-name">{userName.toUpperCase()}</p>
                <p className="cardholder-title">THE COMMISSIONER</p>
              </div>
              <img 
                src="/images/BankrollLogoTransparent.png"
                alt="Bankroll"
                className="bankroll-logo"
              />
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="card-face card-back">
          <div className="card-shimmer"></div>
          <div className="card-content">
            {/* Magnetic Strip */}
            <div className="magnetic-strip"></div>

            {/* Card Details */}
            <div className="card-details">
              {/* Full Card Number */}
              <div className="detail-row">
                <label>Card Number</label>
                <div className="detail-value">
                  <span>{formatCardNumber(cardNumber, showNumber)}</span>
                  <button
                    className="interactive-element eye-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNumber(!showNumber);
                    }}
                  >
                    {showNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Expiry and CVV */}
              <div className="detail-row-split">
                <div className="detail-group">
                  <label>Valid Thru</label>
                  <div className="detail-value">
                    <span>{showExpiry ? expiryDate : "••/••"}</span>
                    <button
                      className="interactive-element eye-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExpiry(!showExpiry);
                      }}
                    >
                      {showExpiry ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="detail-group">
                  <label>CVV</label>
                  <div className="detail-value">
                    <span>{showCVV ? cvv : "•••"}</span>
                    <button
                      className="interactive-element eye-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCVV(!showCVV);
                      }}
                    >
                      {showCVV ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="signature-area">
                <div className="signature-box">
                  <p className="signature">{userName}</p>
                </div>
              </div>

              {/* Bottom Branding */}
              <div className="back-footer">
                <img 
                  src="/images/BankrollLogoTransparent.png"
                  alt="Bankroll"
                  className="bankroll-logo-small"
                />
                <p className="security-text">For exclusive use by fantasy league commissioners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionersCard;