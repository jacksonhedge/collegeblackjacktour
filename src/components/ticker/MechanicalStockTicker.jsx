import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useStockData } from '../../hooks/useStockData';
import './MechanicalStockTicker.css';

// Component for individual rolling digits
const MechanicalDigit = ({ value, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayValue(value);
        setTimeout(() => {
          setIsAnimating(false);
        }, 400);
      }, delay);
      prevValueRef.current = value;
    }
  }, [value, delay]);

  return (
    <div className="mechanical-digit">
      <div className={`digit-flipper ${isAnimating ? 'flipping' : ''}`}>
        <div className="digit-face front">{displayValue}</div>
        <div className="digit-face back">{value}</div>
      </div>
    </div>
  );
};

// Component for displaying numbers with mechanical animation
const MechanicalNumber = ({ number, decimals = 2, prefix = '', isPositive = true, compact = false }) => {
  let formattedNumber;
  
  if (compact && number >= 1000) {
    // Format large numbers with commas
    const parts = number.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNumber = parts.join('.');
  } else {
    formattedNumber = number.toFixed(decimals);
  }
  
  const characters = formattedNumber.split('');
  
  return (
    <span className={`mechanical-number ${isPositive ? 'positive' : 'negative'}`}>
      {prefix && <span className="prefix">{prefix}</span>}
      {characters.map((char, index) => (
        char === '.' ? (
          <span key={index} className="decimal-point">.</span>
        ) : char === ',' ? (
          <span key={index} className="comma">,</span>
        ) : (
          <MechanicalDigit 
            key={index} 
            value={char} 
            delay={index * 30}
          />
        )
      ))}
    </span>
  );
};

// Individual stock item component
const StockItem = ({ stock }) => {
  const isPositive = stock.change >= 0;
  const changeSymbol = isPositive ? '▲' : '▼';
  
  // Determine decimals and prefix based on asset type
  const decimals = stock.isIndex ? 2 : stock.isCrypto ? 2 : 2;
  const prefix = stock.isCrypto || !stock.isIndex ? '$' : '';
  const compact = stock.price >= 1000;

  return (
    <div className="stock-item">
      <span className="stock-symbol">{stock.symbol}</span>
      <MechanicalNumber 
        number={stock.price} 
        decimals={decimals} 
        prefix={prefix} 
        isPositive={true}
        compact={compact}
      />
      <span className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        <span className="change-symbol">{changeSymbol}</span>
        <MechanicalNumber 
          number={Math.abs(stock.change)} 
          decimals={2} 
          isPositive={isPositive}
          compact={stock.isIndex}
        />
        <span className="change-percent">
          ({isPositive ? '+' : '-'}{Math.abs(stock.changePercent).toFixed(2)}%)
        </span>
      </span>
    </div>
  );
};

// Main ticker component
const MechanicalStockTicker = () => {
  const { isDark } = useTheme();
  const tickerRef = useRef(null);
  
  // Use the stock data hook with options
  const { 
    stockData, 
    isLoading, 
    error, 
    marketStatus,
    isUsingMockData 
  } = useStockData({
    updateInterval: 30000, // Update every 30 seconds for real data
    simulateUpdates: true, // Keep demo updates active
  });

  // Show loading state
  if (isLoading && stockData.length === 0) {
    return (
      <div className={`mechanical-stock-ticker ${isDark ? 'dark' : 'light'}`}>
        <div className="ticker-container">
          <div className="flex items-center justify-center h-14">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading market data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Duplicate stocks for seamless scrolling
  const duplicatedStocks = [...stockData, ...stockData];

  return (
    <div className={`mechanical-stock-ticker ${isDark ? 'dark' : 'light'}`}>
      <div className="ticker-wrapper">
        {/* Market Status Indicator */}
        <div className="market-status">
          <div className={`status-dot ${marketStatus.isOpen ? 'open' : 'closed'}`} />
          <span className="status-text">
            {marketStatus.isOpen ? 'Market Open' : 'Market Closed'}
          </span>
          {isUsingMockData && (
            <span className="demo-badge">Demo Data</span>
          )}
        </div>
        
        {/* Ticker Content */}
        <div className="ticker-container">
          <div className="ticker-track" ref={tickerRef}>
            <div className="ticker-content">
              {duplicatedStocks.map((stock, index) => (
                <StockItem key={`${stock.symbol}-${index}`} stock={stock} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && !isUsingMockData && (
          <div className="ticker-error">
            <span>Unable to fetch live data. Using cached values.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MechanicalStockTicker;