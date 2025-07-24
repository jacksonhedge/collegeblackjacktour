import React, { useEffect, useState } from 'react';
import polygonApi from '../services/polygonApi';
import { useTheme } from '../contexts/ThemeContext';

const TestPolygon = () => {
  const { isDark } = useTheme();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runTests = async () => {
      setLoading(true);
      const testResults = {};

      try {
        // Test 1: Market Status
        console.log('Testing market status...');
        const marketStatus = await polygonApi.getMarketStatus();
        testResults.marketStatus = { success: true, data: marketStatus };

        // Test 2: Single Stock Price (AAPL)
        console.log('Testing single stock price...');
        const applePrice = await polygonApi.getTickerPrice('AAPL');
        testResults.stockPrice = { success: true, data: applePrice };

        // Test 3: Index Data (S&P 500)
        console.log('Testing index data...');
        const spxData = await polygonApi.getIndexData('SPX');
        testResults.indexData = { success: true, data: spxData };

        // Test 4: Crypto Price (Bitcoin)
        console.log('Testing crypto price...');
        const btcPrice = await polygonApi.getCryptoPrice('BTC');
        testResults.cryptoPrice = { success: true, data: btcPrice };

        // Test 5: Multiple Tickers
        console.log('Testing multiple tickers...');
        const multipleStocks = await polygonApi.getMultipleTickerPrices(['AAPL', 'GOOGL', 'MSFT']);
        testResults.multipleStocks = { success: true, data: multipleStocks };

        setResults(testResults);
      } catch (err) {
        setError(err.message);
        console.error('Test error:', err);
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-8">Polygon API Test Results</h1>
      
      {loading && (
        <div className="text-lg">Running API tests...</div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-red-500">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Market Status */}
          {results.marketStatus && (
            <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">Market Status</h2>
              <div className="space-y-2">
                <p>Status: <span className={`font-bold ${results.marketStatus.data.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                  {results.marketStatus.data.market}
                </span></p>
                <p>After Hours: {results.marketStatus.data.afterHours ? 'Open' : 'Closed'}</p>
              </div>
            </div>
          )}

          {/* Stock Price */}
          {results.stockPrice && (
            <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">Apple (AAPL) Stock Price</h2>
              <div className="space-y-2">
                <p>Price: {formatPrice(results.stockPrice.data.price)}</p>
                <p className={results.stockPrice.data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  Change: {formatPrice(results.stockPrice.data.change)} ({results.stockPrice.data.changePercent.toFixed(2)}%)
                </p>
                <p>Volume: {results.stockPrice.data.volume?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Index Data */}
          {results.indexData && (
            <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">S&P 500 Index</h2>
              <div className="space-y-2">
                <p>Value: {results.indexData.data.price.toFixed(2)}</p>
                <p className={results.indexData.data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  Change: {results.indexData.data.change.toFixed(2)} ({results.indexData.data.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          )}

          {/* Crypto Price */}
          {results.cryptoPrice && (
            <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">Bitcoin (BTC)</h2>
              <div className="space-y-2">
                <p>Price: {formatPrice(results.cryptoPrice.data.price)}</p>
                <p className={results.cryptoPrice.data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  Change: {formatPrice(results.cryptoPrice.data.change)} ({results.cryptoPrice.data.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          )}

          {/* Multiple Stocks */}
          {results.multipleStocks && (
            <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">Multiple Stocks</h2>
              <div className="space-y-3">
                {results.multipleStocks.data.map(stock => (
                  <div key={stock.symbol} className="flex justify-between items-center">
                    <span className="font-medium">{stock.symbol}</span>
                    <span>{stock.price ? formatPrice(stock.price) : 'N/A'}</span>
                    <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {stock.changePercent ? `${stock.changePercent.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-sm opacity-70">
        <p>API Key Status: {process.env.REACT_APP_POLYGON_API_KEY ? '✅ Configured' : '❌ Not Found'}</p>
        <p>Test completed at: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestPolygon;