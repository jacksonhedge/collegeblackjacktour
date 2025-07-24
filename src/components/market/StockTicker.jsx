import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const StockTicker = () => {
  const { isDark } = useTheme();
  const [marketStatus, setMarketStatus] = useState('open');
  const [currentDate, setCurrentDate] = useState('');
  
  // Mock stock data - replace with real API data
  const [stocks] = useState([
    { symbol: 'S&P 500', value: 6206.36, change: 0.02, percentage: 0.02 },
    { symbol: 'Nasdaq', value: 22525.77, change: 0.68, percentage: 0.68 },
    { symbol: 'VIX', value: 16.57, change: -0.96, percentage: -0.96 },
    { symbol: 'Bitcoin', value: 105934.16, change: 2.25, percentage: 2.25 },
    { symbol: 'UST 6M', value: 4.52, change: -0.01, percentage: -0.01 }
  ]);

  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { month: 'short', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
    
    // Check market hours (9:30 AM - 4:00 PM ET on weekdays)
    const hours = date.getHours();
    const day = date.getDay();
    const isWeekday = day > 0 && day < 6;
    const isMarketHours = hours >= 9.5 && hours < 16;
    
    setMarketStatus(isWeekday && isMarketHours ? 'open' : 'closed');
  }, []);

  const formatValue = (value, symbol) => {
    if (symbol === 'Bitcoin') {
      return `$${value.toLocaleString()}`;
    } else if (symbol === 'UST 6M') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className={`stock-ticker ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-1">
          {/* Market Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${marketStatus === 'open' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {marketStatus === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentDate}
              </span>
            </div>
          </div>

          {/* Stock Prices */}
          <div className="flex items-center gap-3">
            {stocks.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center gap-2">
                {index > 0 && (
                  <div className={`h-3 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                )}
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stock.symbol}
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatValue(stock.value, stock.symbol)}
                  </span>
                  <div className={`flex items-center gap-0.5 ${getChangeColor(stock.change)}`}>
                    {getChangeIcon(stock.change)}
                    <span className="text-xs">
                      {stock.percentage > 0 ? '+' : ''}{stock.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Link */}
          <button className={`text-xs ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
            Summary →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockTicker;