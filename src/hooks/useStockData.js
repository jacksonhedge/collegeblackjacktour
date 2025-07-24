import { useState, useEffect, useCallback } from 'react';
import polygonApi from '../services/polygonApi';

// Default tickers to track
const DEFAULT_TICKERS = [
  { symbol: 'SPX', name: 'S&P 500', type: 'index' },
  { symbol: 'NDX', name: 'Nasdaq', type: 'index' },
  { symbol: 'VIX', name: 'VIX', type: 'index' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
];

// Fallback mock data for development/demo
const MOCK_DATA = [
  { symbol: 'S&P 500', name: 'S&P 500 Index', price: 6206.36, change: 1.24, changePercent: 0.02, isIndex: true },
  { symbol: 'Nasdaq', name: 'Nasdaq Index', price: 22525.77, change: 153.12, changePercent: 0.68, isIndex: true },
  { symbol: 'VIX', name: 'Volatility Index', price: 16.57, change: -0.16, changePercent: -0.96, isIndex: true },
  { symbol: 'BTC', name: 'Bitcoin', price: 105934.16, change: 2384.52, changePercent: 2.25, isCrypto: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: 2.45, changePercent: 1.39 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.87, change: -1.23, changePercent: -0.85 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.67, changePercent: 1.25 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.74, change: 5.89, changePercent: 2.53 },
];

export const useStockData = (options = {}) => {
  const {
    tickers = DEFAULT_TICKERS,
    updateInterval = 30000, // 30 seconds default
    useMockData = !process.env.REACT_APP_POLYGON_API_KEY,
    simulateUpdates = true // For demo purposes
  } = options;

  const [stockData, setStockData] = useState(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketStatus, setMarketStatus] = useState({ isOpen: true, market: 'open' });
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Simulate price updates for demo
  const simulatePriceUpdate = useCallback((currentData) => {
    return currentData.map(stock => {
      const changeAmount = (Math.random() - 0.5) * 4;
      const changePercent = (changeAmount / stock.price) * 100;
      const newPrice = Math.max(0.01, stock.price + changeAmount);
      
      return {
        ...stock,
        price: newPrice,
        change: stock.change + changeAmount,
        changePercent: stock.changePercent + changePercent,
      };
    });
  }, []);

  // Fetch real data from Polygon API
  const fetchRealData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch market status
      const status = await polygonApi.getMarketStatus();
      setMarketStatus(status);
      
      // Fetch stock data
      const stockPromises = tickers.map(async (ticker) => {
        try {
          let data;
          
          if (ticker.type === 'index') {
            data = await polygonApi.getIndexData(ticker.symbol);
          } else if (ticker.type === 'crypto') {
            data = await polygonApi.getCryptoPrice(ticker.symbol);
          } else {
            data = await polygonApi.getTickerPrice(ticker.symbol);
          }
          
          return {
            symbol: ticker.symbol,
            name: ticker.name,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            isIndex: ticker.type === 'index',
            isCrypto: ticker.type === 'crypto',
            volume: data.volume,
            timestamp: data.timestamp
          };
        } catch (err) {
          console.error(`Failed to fetch ${ticker.symbol}:`, err);
          // Return previous data or mock data for this ticker
          const existing = stockData.find(s => s.symbol === ticker.symbol);
          return existing || MOCK_DATA.find(s => s.symbol === ticker.symbol);
        }
      });
      
      const results = await Promise.all(stockPromises);
      setStockData(results.filter(Boolean));
      setError(null);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err.message);
      // Fall back to mock data on error
      if (stockData.length === 0) {
        setStockData(MOCK_DATA);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tickers, stockData]);

  // Main effect for data fetching
  useEffect(() => {
    if (useMockData) {
      // Use mock data with simulated updates
      setIsLoading(false);
      
      if (simulateUpdates) {
        const interval = setInterval(() => {
          setStockData(prev => simulatePriceUpdate(prev));
          setLastUpdate(Date.now());
        }, 5000); // Update every 5 seconds for demo
        
        return () => clearInterval(interval);
      }
    } else {
      // Fetch real data
      fetchRealData();
      
      // Set up polling interval
      const interval = setInterval(fetchRealData, updateInterval);
      
      return () => clearInterval(interval);
    }
  }, [useMockData, simulateUpdates, updateInterval, fetchRealData, simulatePriceUpdate]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (useMockData && simulateUpdates) {
      setStockData(prev => simulatePriceUpdate(prev));
      setLastUpdate(Date.now());
    } else {
      fetchRealData();
    }
  }, [useMockData, simulateUpdates, fetchRealData, simulatePriceUpdate]);

  return {
    stockData,
    isLoading,
    error,
    marketStatus,
    lastUpdate,
    refresh,
    isUsingMockData: useMockData
  };
};