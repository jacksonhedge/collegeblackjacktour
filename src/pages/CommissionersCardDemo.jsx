import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/SupabaseAuthContext';
import CommissionersCard from '../components/commissioners-card/CommissionersCard';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommissionersCardDemo = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showFeatures, setShowFeatures] = useState(true);
  
  const userName = currentUser?.profile?.first_name && currentUser?.profile?.last_name 
    ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
    : currentUser?.profile?.username || 'John Doe';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Commissioners Card
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Card Section */}
          <div>
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className={`text-xl font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Commissioners Card
              </h2>
              <CommissionersCard 
                userName={userName}
                cardNumber="4242424242424242"
                expiryDate="12/28"
                cvv="123"
                defaultSuit="spade"
                defaultPlatform="sleeper"
              />
              <p className={`text-sm text-center mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Click the card to flip • Hover to see shimmer effect
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Premium Features
              </h2>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎨 Customizable Design
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Choose your card suit (Spade, Heart, Diamond, Club) and fantasy platform logo
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🔒 Secure Information
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Toggle visibility for card number, expiry date, and CVV with eye icons
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ✨ Premium Materials
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Metallic finish with shimmer effects and 3D flip animation
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💰 League Management
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Dedicated card for managing league funds separately from personal accounts
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Coming Soon
              </h3>
              <ul className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Instant payouts to league winners</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Real-time transaction tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>No monthly fees for active leagues</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Virtual and physical card options</span>
                </li>
              </ul>
              
              <button className="w-full mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                Request Early Access
              </button>
              
              <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Available Q1 2025 for verified commissioners
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionersCardDemo;