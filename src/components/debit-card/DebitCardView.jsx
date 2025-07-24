import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import CommissionersCard from '../commissioners-card/CommissionersCard';

const DebitCardView = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  
  const userName = currentUser?.profile?.first_name && currentUser?.profile?.last_name 
    ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
    : currentUser?.profile?.username || 'Commissioner';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative z-10 w-full max-w-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Commissioners Card
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Display Area */}
        <div className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Interactive Commissioners Card */}
            <CommissionersCard 
              userName={userName}
              cardNumber="4242424242424242"
              expiryDate="12/28"
              cvv="123"
              defaultSuit="spade"
              defaultPlatform="sleeper"
            />

            {/* Card Features */}
            <div className={`w-full max-w-md space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Card Features
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm">Instant payouts to league winners</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm">Separate league funds from personal accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm">Real-time transaction tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm">No monthly fees for active leagues</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="w-full max-w-md">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Request Early Access
              </Button>
              <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Available Q1 2025 for verified commissioners
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebitCardView;