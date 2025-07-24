import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Info,
  Lock,
  Sparkles,
  Bitcoin,
  PiggyBank,
  Building,
  ChevronRight,
  Settings,
  Gift
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { toast } from 'react-hot-toast';
import DebitCardView from '../debit-card/DebitCardView';

// Mock portfolio data - replace with real data
const generateChartData = () => {
  const points = 50;
  const data = [];
  let value = 1000;
  
  for (let i = 0; i < points; i++) {
    value = value + (Math.random() - 0.5) * 50;
    data.push({
      x: i,
      y: Math.max(0, value)
    });
  }
  return data;
};

const PortfolioDashboard = ({ onAddFunds, onViewBundles }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [selectedView, setSelectedView] = useState('spend');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [isGoldTier, setIsGoldTier] = useState(false);
  const [showDebitCard, setShowDebitCard] = useState(false);
  const [showSpinRefill, setShowSpinRefill] = useState(false);
  const [hasDailySpin, setHasDailySpin] = useState(false);

  useEffect(() => {
    // Generate chart data
    setChartData(generateChartData());
    
    // Check user tier - mock for now
    setIsGoldTier(false); // Set to true for Gold tier users

    // Check for daily spin availability
    const checkSpinRefill = () => {
      const lastCheck = localStorage.getItem('lastSpinRefillCheck');
      const now = Date.now();
      
      // Always check if user has spins available
      const spinnerCount = parseInt(localStorage.getItem('spinnerCount') || '0');
      setHasDailySpin(spinnerCount > 0);
      
      if (!lastCheck || now - parseInt(lastCheck) > 60000) { // Check every minute
        const lastResetTime = localStorage.getItem('lastSpinnerReset');
        
        if (lastResetTime) {
          const timeSinceReset = now - parseInt(lastResetTime);
          const fiveMinutes = 5 * 60 * 1000;
          
          // Show notification if spin was recently refilled (within last 5 minutes)
          if (timeSinceReset < fiveMinutes && spinnerCount > 0) {
            setShowSpinRefill(true);
            // Auto-hide after 10 seconds
            setTimeout(() => setShowSpinRefill(false), 10000);
          }
        }
        
        localStorage.setItem('lastSpinRefillCheck', now.toString());
      }
    };

    checkSpinRefill();
    const interval = setInterval(checkSpinRefill, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const getDisplayValue = () => {
    switch (selectedView) {
      case 'spend':
        return portfolioValue || 0;
      case 'invested':
        return portfolioValue * 1.5 || 0;
      case 'fantasy':
        return portfolioValue * 0.8 || 0;
      default:
        return 0;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleAddFunds = () => {
    // Call the passed in handler or show toast
    if (onAddFunds) {
      onAddFunds();
    } else {
      toast.success('Add funds clicked');
    }
  };

  const handleStartInvesting = () => {
    toast.success('Start investing clicked');
  };

  // Simple line chart component
  const LineChart = ({ data }) => {
    const width = 800;
    const height = 200;
    const padding = 40;
    
    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
          <text x={width/2} y={height/2} textAnchor="middle" fill={isDark ? '#666' : '#999'}>
            No data available
          </text>
        </svg>
      );
    }
    
    // Calculate min and max values
    const values = data.map(d => d.y);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1; // Prevent division by zero
    
    // Create SVG path
    const pathData = data.map((point, index) => {
      const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((point.y - minValue) / valueRange) * (height - 2 * padding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1={padding}
            x2={width - padding}
            y1={padding + (i * (height - 2 * padding) / 4)}
            y2={padding + (i * (height - 2 * padding) / 4)}
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="1"
          />
        ))}
        
        {/* Chart line */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
          />
        )}
        
        {/* Area under line */}
        {pathData && (
          <path
            d={`${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#gradient)"
            opacity="0.2"
          />
        )}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className={`portfolio-dashboard p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Portfolio Section */}
          <div className="lg:col-span-2">
            {/* Portfolio Value Card */}
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} mb-6`}>
              <CardContent className="p-6">
                {/* Value Display */}
                <div className="mb-4">
                  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(getDisplayValue())}
                  </h1>
                  
                  {/* View Selector */}
                  <RadioGroup 
                    value={selectedView} 
                    onValueChange={setSelectedView}
                    className="flex gap-6 mt-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="spend" id="spend" />
                      <Label htmlFor="spend" className="cursor-pointer">Spend</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="invested" id="invested" />
                      <Label htmlFor="invested" className="cursor-pointer">Invested</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fantasy" id="fantasy" />
                      <Label htmlFor="fantasy" className="cursor-pointer">Fantasy League Portfolio</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Add Funds Button and Investing Link */}
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    onClick={handleAddFunds}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Funds
                  </Button>
                  
                  <button 
                    onClick={handleStartInvesting}
                    className="text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center gap-1"
                  >
                    Start investing to see your return
                    <Info className="w-3 h-3" />
                  </button>
                </div>

                {/* Chart */}
                <div className="mt-6">
                  <LineChart data={chartData} />
                  
                  {/* Time period selector */}
                  <div className="flex justify-center gap-4 mt-4">
                    {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'All'].map(period => (
                      <button
                        key={period}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          period === '1M' 
                            ? 'bg-purple-600 text-white' 
                            : isDark 
                              ? 'text-gray-400 hover:text-white' 
                              : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                    <button className={`p-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-6 mt-6 border-b border-gray-200 dark:border-gray-700">
                  {['Return', 'Allocation', 'Income', 'Account value'].map(tab => (
                    <button
                      key={tab}
                      className={`pb-2 text-sm font-medium transition-colors ${
                        tab === 'Return'
                          ? 'text-purple-600 border-b-2 border-purple-600'
                          : isDark 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Build Your Portfolio Section */}
            <div>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Build your portfolio
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Crypto */}
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} cursor-pointer hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <Bitcoin className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Crypto
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Explore Bitcoin, Ethereum and more
                    </p>
                  </CardContent>
                </Card>

                {/* Treasuries - Gold Tier Only */}
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} ${!isGoldTier ? 'opacity-60' : 'cursor-pointer hover:shadow-lg'} transition-shadow relative`}>
                  <CardContent className="p-6 text-center">
                    {!isGoldTier && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                    <div className="flex justify-center mb-3">
                      <PiggyBank className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Treasuries
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Lock in risk-free yields for up to 30 years
                    </p>
                    {!isGoldTier && (
                      <span className="text-xs text-yellow-500 mt-2 inline-block">
                        Gold Tier Only
                      </span>
                    )}
                  </CardContent>
                </Card>

                {/* IRA - Gold Tier Only */}
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} ${!isGoldTier ? 'opacity-60' : 'cursor-pointer hover:shadow-lg'} transition-shadow relative`}>
                  <CardContent className="p-6 text-center">
                    {!isGoldTier && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                    <div className="flex justify-center mb-3">
                      <Building className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'} flex items-center justify-center gap-1`}>
                      IRA <span className="text-xs bg-green-500 text-white px-1 py-0.5 rounded">1% match</span>
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Invest in a Traditional or Roth IRA
                    </p>
                    {!isGoldTier && (
                      <span className="text-xs text-yellow-500 mt-2 inline-block">
                        Gold Tier Only
                      </span>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Updates */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Updates
                </h2>
                <button className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Daily Spin Section - Always show if user has spins */}
              {hasDailySpin && (
                <Card className={`mb-4 ${showSpinRefill ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-400 animate-pulse' : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className={`w-8 h-8 ${showSpinRefill ? 'text-white animate-bounce' : 'text-yellow-500'}`} />
                        <div>
                          <h3 className={`font-semibold ${showSpinRefill ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                            Daily Spin Available!
                          </h3>
                          <p className={`text-sm ${showSpinRefill ? 'text-white/90' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Spin the wheel for prizes
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setShowSpinRefill(false);
                          // Trigger opening the spinner modal in parent
                          if (window.openDailySpinner) {
                            window.openDailySpinner();
                          }
                        }}
                        className={showSpinRefill ? "bg-white text-amber-600 hover:bg-white/90" : "bg-yellow-500 hover:bg-yellow-600 text-white"}
                        size="sm"
                      >
                        Spin Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* APY Earnings Card */}
              <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} mb-4`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Earn a 3.5% APY*
                      </h3>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Put your fantasy league dues to work in the no-fee high-yield cash account you've been waiting for.
                      </p>
                      <Button 
                        onClick={() => onViewBundles && onViewBundles()}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                        size="sm"
                      >
                        Deposit now
                      </Button>
                    </div>
                    <div className="ml-4">
                      <Sparkles className="w-16 h-16 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commissioners Card */}
              <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} mb-4`}>
                <CardContent className="p-4">
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Commissioners Card
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    A dedicated debit card for league commissioners to manage dues and payouts seamlessly.
                  </p>
                  <Button 
                    onClick={() => setShowDebitCard(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    size="sm"
                  >
                    View
                  </Button>
                </CardContent>
              </Card>

              {/* Fantasy League Investment Card */}
              <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardContent className="p-4">
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Fantasy League Investment Fund
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pool your league dues and invest together. Earn returns on your fantasy winnings throughout the season.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    size="sm"
                  >
                    Learn more
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debit Card View Modal */}
      <DebitCardView 
        isOpen={showDebitCard} 
        onClose={() => setShowDebitCard(false)} 
      />
    </div>
  );
};

export default PortfolioDashboard;