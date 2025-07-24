import React from 'react';
import { FundType, UserFunds, getFundRules } from '../../types/funds';
import { formatCurrency } from '../../lib/utils';
import { 
  Wallet, 
  Gift, 
  Send, 
  Lock, 
  Unlock,
  Info,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface FundBalanceDisplayProps {
  userFunds: UserFunds | null;
  showDetails?: boolean;
  className?: string;
}

interface FundTypeConfig {
  type: FundType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

const FUND_CONFIGS: FundTypeConfig[] = [
  {
    type: FundType.CASH,
    label: 'Cash Balance',
    icon: Wallet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Withdrawable and transferable funds'
  },
  {
    type: FundType.SENDABLE,
    label: 'Sendable Balance',
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Transferable but non-withdrawable funds'
  },
  {
    type: FundType.PROMO,
    label: 'Promo Balance',
    icon: Gift,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Bonus funds for platform activities'
  }
];

export function FundBalanceDisplay({ 
  userFunds, 
  showDetails = false,
  className = '' 
}: FundBalanceDisplayProps) {
  if (!userFunds) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center text-gray-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Unable to load fund balances</span>
        </div>
      </div>
    );
  }

  const renderFundCard = (config: FundTypeConfig) => {
    const balance = userFunds.balances[config.type];
    const rules = getFundRules(config.type);
    const Icon = config.icon;
    
    return (
      <div key={config.type} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`${config.bgColor} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
              <h3 className="font-semibold text-gray-900">{config.label}</h3>
            </div>
            {balance.locked > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="h-4 w-4 mr-1" />
                <span>{formatCurrency(balance.locked)} locked</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(balance.amount)}
            </span>
            <span className="text-sm text-gray-500">
              Available: {formatCurrency(balance.available)}
            </span>
          </div>
          
          {showDetails && (
            <>
              <p className="text-sm text-gray-600 mb-3">{config.description}</p>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between py-1 border-t border-gray-100">
                  <span className="text-gray-500">Withdrawable</span>
                  <span className={rules.withdrawable ? 'text-green-600' : 'text-gray-400'}>
                    {rules.withdrawable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Transferable</span>
                  <span className={rules.transferable ? 'text-green-600' : 'text-gray-400'}>
                    {rules.transferable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Expires</span>
                  <span className={rules.expirable ? 'text-orange-600' : 'text-gray-400'}>
                    {rules.expirable ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Total Balance Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(userFunds.totalBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm font-medium">Available</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(userFunds.totalAvailable)}</p>
          </div>
        </div>
        
        {userFunds.totalBalance > userFunds.totalAvailable && (
          <div className="mt-4 flex items-center text-sm bg-white/20 rounded-lg px-3 py-2">
            <Info className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {formatCurrency(userFunds.totalBalance - userFunds.totalAvailable)} is locked in pending operations
            </span>
          </div>
        )}
      </div>

      {/* Individual Fund Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FUND_CONFIGS.map(renderFundCard)}
      </div>

      {/* Fund Usage Tips */}
      {showDetails && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Fund Usage Priority
          </h4>
          <p className="text-sm text-blue-700">
            When placing bets or playing games, funds are used in this order:
          </p>
          <ol className="mt-2 space-y-1 text-sm text-blue-700">
            <li>1. Promo funds (if eligible)</li>
            <li>2. Sendable funds</li>
            <li>3. Cash funds</li>
          </ol>
        </div>
      )}
    </div>
  );
}