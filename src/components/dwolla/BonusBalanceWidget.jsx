import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useDwolla } from '../../contexts/DwollaContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Gift } from 'lucide-react';

const BonusBalanceWidget = () => {
  const { currentUser } = useAuth();
  const { bonusBalance, isLoading } = useDwolla();

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
        <CardTitle className="text-sm font-medium text-gray-400">
          Bonus Balance
        </CardTitle>
        <Gift className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-400">
          ${(bonusBalance || 0).toFixed(2)}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {currentUser?.displayName || 'Your'} Bonus Account
        </p>
        <Link 
          to="/rewards"
          className="mt-4 inline-flex items-center text-sm text-purple-400 hover:text-purple-300"
        >
          <Gift className="w-4 h-4 mr-1" />
          Earn More Bonus
        </Link>
      </CardContent>
    </Card>
  );
};

export default BonusBalanceWidget;
