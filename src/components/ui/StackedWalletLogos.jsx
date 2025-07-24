import React from 'react';

const StackedWalletLogos = ({ wallets = [], limit = 3 }) => {
  const displayWallets = wallets.slice(0, limit);
  const remainingCount = Math.max(0, wallets.length - limit);

  const getWalletLogo = (type) => {
    switch (type.toLowerCase()) {
      case 'draftkings':
        return '/images/draftkings.png';
      case 'fanduel':
        return '/images/fanduel.png';
      case 'betmgm':
        return '/images/betmgm.png';
      case 'caesars':
        return '/images/caesars.png';
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {displayWallets.map((wallet, index) => (
          <div
            key={wallet.type || index}
            className="relative ring-2 ring-gray-900 rounded-full bg-gray-800 w-8 h-8 flex items-center justify-center"
            style={{
              zIndex: displayWallets.length - index
            }}
          >
            <img
              src={getWalletLogo(wallet.type)}
              alt={wallet.type}
              className="w-6 h-6 object-contain rounded-full"
            />
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="ml-2 text-sm text-gray-400">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default StackedWalletLogos;
