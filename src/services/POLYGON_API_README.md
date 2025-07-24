# Polygon.io API Integration

This integration provides real-time stock market data for the mechanical stock ticker component.

## Setup

1. **Get your API Key**
   - Sign up at [Polygon.io](https://polygon.io/dashboard)
   - Free tier includes:
     - 5 API calls per minute
     - End-of-day data
     - Real-time aggregates
     - Market status

2. **Configure Environment**
   ```bash
   # Add to your .env file
   REACT_APP_POLYGON_API_KEY=your_api_key_here
   ```

3. **Test the Integration**
   - The ticker will automatically detect if an API key is present
   - Without an API key, it uses mock data with simulated updates
   - With an API key, it fetches real market data

## Features

### Supported Asset Types
- **Stocks**: AAPL, GOOGL, MSFT, TSLA, etc.
- **Indices**: S&P 500 (SPX), Nasdaq (NDX), VIX
- **Crypto**: Bitcoin (BTC), Ethereum (ETH)

### Data Updates
- Real data updates every 30 seconds (configurable)
- Market status indicator (Open/Closed)
- Automatic caching to reduce API calls
- Fallback to cached data on errors

### Rate Limiting
- Built-in rate limiting (1 request/second for free tier)
- Request queuing and automatic retry
- Cache system to minimize API usage

## Usage

### Basic Implementation
```javascript
import { useStockData } from './hooks/useStockData';

const MyComponent = () => {
  const { stockData, isLoading, marketStatus } = useStockData({
    updateInterval: 30000, // 30 seconds
    tickers: [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
      { symbol: 'SPX', name: 'S&P 500', type: 'index' },
      { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' }
    ]
  });

  // Use the data...
};
```

### Customizing Tickers
Edit the `DEFAULT_TICKERS` array in `/src/hooks/useStockData.js`:

```javascript
const DEFAULT_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  // Add your tickers here
];
```

## API Limits & Upgrades

### Free Tier (Basic)
- 5 API calls/minute
- End-of-day data
- 2 years historical data

### Paid Plans
- **Starter ($29/mo)**: 100 calls/minute, websocket access
- **Developer ($99/mo)**: 1000 calls/minute, real-time data
- **Advanced ($199/mo)**: Unlimited calls, all features

## Troubleshooting

### "Demo Data" Badge Shows
- Check if `REACT_APP_POLYGON_API_KEY` is set correctly
- Verify API key is valid in Polygon dashboard

### Rate Limit Errors
- Reduce `updateInterval` in useStockData hook
- Consider upgrading to a paid plan
- Check API usage in Polygon dashboard

### Market Closed Message
- Normal outside NYSE trading hours (9:30 AM - 4:00 PM ET)
- Crypto data updates 24/7
- After-hours data available with paid plans

## Security Notes

- Never commit API keys to version control
- Use environment variables for all keys
- Consider using a backend proxy for production
- API keys are visible in browser - use backend for sensitive operations

## Support

- [Polygon.io Documentation](https://polygon.io/docs)
- [API Reference](https://polygon.io/docs/stocks/getting-started)
- [Support](https://polygon.io/support)