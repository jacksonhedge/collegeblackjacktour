import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useWallet } from '../../contexts/WalletContext';
import { PlatformId, BonusBalance, toDate, formatDate } from '../../types/wallet';

const WalletBalanceDisplay = ({ platformId }: { platformId: PlatformId }) => {
  const { wallets, loading } = useWallet();

  // Debug logging
  useEffect(() => {
    console.log('=== WalletBalanceDisplay Debug ===');
    console.log('Platform ID:', platformId);
    console.log('All wallets data:', wallets);
    
    if (wallets && wallets.subWallets) {
      console.log('All subWallets:', wallets.subWallets);
      
      const subWallet = wallets.subWallets[platformId];
      if (subWallet) {
        console.log('Found subWallet:', {
          platformId,
          name: subWallet.name,
          totalBonusBalance: calculateWalletBonusBalance(subWallet),
          bonusBalances: subWallet.bonusBalances,
          rawSubWallet: subWallet
        });

        // Log each bonus balance
        if (Array.isArray(subWallet.bonusBalances)) {
          console.log('Individual bonus balances:');
          subWallet.bonusBalances.forEach((bonus: BonusBalance, index: number) => {
            console.log(`Bonus ${index}:`, {
              id: bonus.id,
              amount: bonus.amount,
              description: bonus.description,
              status: bonus.status,
              dateGranted: toDate(bonus.dateGranted),
              dateExpires: bonus.dateExpires ? toDate(bonus.dateExpires) : undefined
            });
          });
        } else {
          console.log('No bonus balances array found');
        }
      } else {
        console.log('No subWallet found for platformId:', platformId);
      }
    } else {
      console.log('No wallets data available');
    }
  }, [wallets, platformId]);

  const calculateWalletBonusBalance = (wallet: any) => {
    if (!wallet?.bonusBalances?.length) return 0;
    
    return wallet.bonusBalances.reduce((total: number, bonus: BonusBalance) => {
      if (bonus.status === 'active' && (!bonus.dateExpires || toDate(bonus.dateExpires) > new Date())) {
        return total + (bonus.amount || 0);
      }
      return total;
    }, 0);
  };
  
  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-gray-500">Loading wallet data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!wallets || !wallets.subWallets) {
    console.log('No wallets data available - rendering loading state');
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-gray-500">Loading wallet data...</div>
        </CardContent>
      </Card>
    );
  }

  const subWallet = wallets.subWallets[platformId];
  
  if (!subWallet) {
    console.log('Wallet not found - rendering not found state');
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-gray-500">Initializing wallet...</div>
        </CardContent>
      </Card>
    );
  }

  // Ensure we have valid arrays and numbers
  const bonusBalances = Array.isArray(subWallet.bonusBalances) ? subWallet.bonusBalances : [];
  const totalBonus = calculateWalletBonusBalance(subWallet);
  const cashBalance = typeof subWallet.cashBalance === 'number' ? subWallet.cashBalance : 0;

  console.log('Wallet data for display:', {
    platformId,
    bonusBalances,
    totalBonus,
    cashBalance
  });
  
  // Filter active bonuses
  const activeBonuses = bonusBalances.filter((bonus: BonusBalance) => 
    bonus.status === 'active' && 
    (!bonus.dateExpires || toDate(bonus.dateExpires) > new Date())
  );

  console.log('Active bonuses for display:', activeBonuses);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <img 
            src={subWallet.logo} 
            alt={subWallet.name} 
            className="w-6 h-6 object-contain"
          />
          {subWallet.name} Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cash Balance:</span>
            <span className="font-medium">
              ${cashBalance.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Bonus Balance:</span>
            <span className="font-medium text-green-600">
              ${totalBonus.toFixed(2)}
            </span>
          </div>

          {activeBonuses.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Active Bonuses:</h4>
              <div className="space-y-2">
                {activeBonuses.map((bonus: BonusBalance) => (
                  <div 
                    key={bonus.id} 
                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {bonus.description || 'Bonus'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(bonus.dateGranted)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      ${bonus.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalanceDisplay;
