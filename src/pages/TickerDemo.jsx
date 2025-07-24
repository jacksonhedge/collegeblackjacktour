import React from 'react';
import MechanicalStockTicker from '../components/ticker/MechanicalStockTicker';
import { useTheme } from '../contexts/ThemeContext';

const TickerDemo = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Theme Toggle */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Mechanical Stock Ticker Demo
        </h1>
        <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Watch the digits roll with a satisfying mechanical animation, reminiscent of old airport departure boards.
        </p>
      </div>
      
      {/* Ticker at the top */}
      <MechanicalStockTicker />
      
      {/* Feature Description */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎰 Mechanical Animation
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Each digit rolls independently with a 3D flip effect, creating a satisfying visual experience.
            </p>
          </div>
          
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📊 Real-time Updates
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Prices update every 5 seconds with staggered digit animations for a realistic mechanical feel.
            </p>
          </div>
          
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎨 Theme Aware
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Seamlessly adapts to light and dark themes with appropriate colors and shadows.
            </p>
          </div>
        </div>
        
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🔧 Technical Details
          </h3>
          <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Smooth horizontal scrolling with seamless loop</li>
            <li>• Individual digit components with 3D CSS transforms</li>
            <li>• Green/red color coding with LED-style glow effects</li>
            <li>• Responsive design that adapts to mobile screens</li>
            <li>• Pause on hover for better readability</li>
            <li>• Support for large numbers with comma formatting</li>
            <li>• Mix of indices, stocks, and crypto assets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TickerDemo;