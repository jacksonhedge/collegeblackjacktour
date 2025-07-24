// Polygon.io API Service
// Documentation: https://polygon.io/docs/stocks/getting-started

const POLYGON_API_KEY = process.env.REACT_APP_POLYGON_API_KEY || 'YOUR_API_KEY_HERE';
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Cache for storing recent data
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests for free tier

class PolygonApiService {
  constructor() {
    this.apiKey = POLYGON_API_KEY;
    this.baseUrl = POLYGON_BASE_URL;
  }

  // Helper method to handle rate limiting
  async rateLimitedFetch(url) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    lastRequestTime = Date.now();
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get real-time price for a single ticker
  async getTickerPrice(symbol) {
    const cacheKey = `price_${symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${this.apiKey}`;
      const data = await this.rateLimitedFetch(url);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const priceData = {
          symbol: symbol,
          price: result.c, // closing price
          change: result.c - result.o, // close - open
          changePercent: ((result.c - result.o) / result.o) * 100,
          volume: result.v,
          timestamp: result.t
        };
        
        cache.set(cacheKey, { data: priceData, timestamp: Date.now() });
        return priceData;
      }
      
      throw new Error('No data available for ticker');
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  // Get grouped daily bars for multiple tickers
  async getMultipleTickerPrices(symbols) {
    try {
      // For free tier, we need to make individual requests
      const promises = symbols.map(symbol => 
        this.getTickerPrice(symbol).catch(err => ({
          symbol,
          error: err.message,
          price: 0,
          change: 0,
          changePercent: 0
        }))
      );
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error fetching multiple ticker prices:', error);
      throw error;
    }
  }

  // Get market status
  async getMarketStatus() {
    const cacheKey = 'market_status';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 2) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/v1/marketstatus/now?apiKey=${this.apiKey}`;
      const data = await this.rateLimitedFetch(url);
      
      const status = {
        market: data.market,
        serverTime: data.serverTime,
        isOpen: data.market === 'open',
        afterHours: data.afterHours === 'open',
        exchanges: data.exchanges
      };
      
      cache.set(cacheKey, { data: status, timestamp: Date.now() });
      return status;
    } catch (error) {
      console.error('Error fetching market status:', error);
      return { isOpen: false, market: 'closed' };
    }
  }

  // Get ticker details (company info)
  async getTickerDetails(symbol) {
    const cacheKey = `details_${symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 10) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/v3/reference/tickers/${symbol}?apiKey=${this.apiKey}`;
      const data = await this.rateLimitedFetch(url);
      
      if (data.status === 'OK' && data.results) {
        const details = {
          symbol: data.results.ticker,
          name: data.results.name,
          market: data.results.market,
          locale: data.results.locale,
          type: data.results.type,
          active: data.results.active,
          currencyName: data.results.currency_name,
          marketCap: data.results.market_cap,
          description: data.results.description
        };
        
        cache.set(cacheKey, { data: details, timestamp: Date.now() });
        return details;
      }
      
      throw new Error('No details available for ticker');
    } catch (error) {
      console.error(`Error fetching details for ${symbol}:`, error);
      throw error;
    }
  }

  // Get real-time crypto price
  async getCryptoPrice(from, to = 'USD') {
    const cacheKey = `crypto_${from}_${to}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}/v2/aggs/ticker/X:${from}${to}/prev?adjusted=true&apiKey=${this.apiKey}`;
      const data = await this.rateLimitedFetch(url);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const priceData = {
          symbol: from,
          pair: `${from}/${to}`,
          price: result.c,
          change: result.c - result.o,
          changePercent: ((result.c - result.o) / result.o) * 100,
          volume: result.v,
          timestamp: result.t
        };
        
        cache.set(cacheKey, { data: priceData, timestamp: Date.now() });
        return priceData;
      }
      
      throw new Error('No data available for crypto pair');
    } catch (error) {
      console.error(`Error fetching crypto price for ${from}/${to}:`, error);
      throw error;
    }
  }

  // Get indices data (S&P 500, etc.)
  async getIndexData(ticker) {
    // Polygon uses special tickers for indices
    const indexMap = {
      'SPX': 'I:SPX', // S&P 500
      'NDX': 'I:NDX', // Nasdaq 100
      'DJI': 'I:DJI', // Dow Jones
      'VIX': 'I:VIX', // Volatility Index
    };

    const mappedTicker = indexMap[ticker] || ticker;
    
    try {
      const url = `${this.baseUrl}/v2/aggs/ticker/${mappedTicker}/prev?adjusted=true&apiKey=${this.apiKey}`;
      const data = await this.rateLimitedFetch(url);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          symbol: ticker,
          price: result.c,
          change: result.c - result.o,
          changePercent: ((result.c - result.o) / result.o) * 100,
          high: result.h,
          low: result.l,
          volume: result.v,
          timestamp: result.t
        };
      }
      
      throw new Error('No data available for index');
    } catch (error) {
      console.error(`Error fetching index data for ${ticker}:`, error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    cache.clear();
  }
}

// Export singleton instance
export default new PolygonApiService();