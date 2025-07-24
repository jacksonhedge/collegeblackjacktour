import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useDwolla } from '../../contexts/DwollaContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { PiggyBank } from 'lucide-react';

const SavingsBalanceWidget = () => {
  const { currentUser } = useAuth();
  const { savingsBalance, isLoading } = useDwolla();

  if (isLoading) {
    return (
      <Card className="bg-gray-900/40 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p className="text-gray-400">Loading balance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/40 border-purple-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Savings Balance
          </CardTitle>
          <span className="text-xs text-purple-400">(Coming Soon)</span>
        </div>
        <PiggyBank className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white opacity-50">
          ${(savingsBalance || 0).toFixed(2)}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {currentUser?.displayName || 'Your'} Savings Account
        </p>
      </CardContent>
    </Card>
  );
};

export default SavingsBalanceWidget;
