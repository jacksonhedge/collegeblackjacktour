import React from 'react';

const partnerLogos = {
  'FanDuel Casino': '/partner-logos/fanduel-casino.jpg',
  'FanDuel Sportsbook': '/partner-logos/fanduel.png',
  'FanDuel Fantasy': '/partner-logos/fanduel.png',
  'DraftKings Casino': '/partner-logos/draftkings-casino.jpg',
  'DraftKings Sportsbook': '/partner-logos/draftkings.png',
  'DraftKings Fantasy': '/partner-logos/draftkings.png',
  'BetMGM Casino': '/partner-logos/betmgm.png',
  'BetMGM Sportsbook': '/partner-logos/betmgm.png',
  'MyPrize': '/partner-logos/myprize.jpg'
};

// Gradient backgrounds for different partners
const getGradientBackground = (name) => {
  const gradients = {
    'B': 'bg-gradient-to-r from-blue-500 to-purple-600',
    'C': 'bg-gradient-to-r from-green-400 to-blue-500',
    'D': 'bg-gradient-to-r from-purple-500 to-pink-500',
    'F': 'bg-gradient-to-r from-yellow-400 to-orange-500',
    'H': 'bg-gradient-to-r from-indigo-500 to-purple-500',
    'J': 'bg-gradient-to-r from-pink-500 to-rose-500',
    'M': 'bg-gradient-to-r from-emerald-500 to-teal-500',
    'P': 'bg-gradient-to-r from-cyan-500 to-blue-500',
    'S': 'bg-gradient-to-r from-orange-500 to-red-500',
    'U': 'bg-gradient-to-r from-red-500 to-pink-500',
    'W': 'bg-gradient-to-r from-violet-500 to-purple-500'
  };
  
  const initial = name.charAt(0).toUpperCase();
  return gradients[initial] || 'bg-gradient-to-r from-gray-500 to-gray-700';
};

const PartnerInitial = ({ name }) => (
  <div className={`h-full w-full flex items-center justify-center ${getGradientBackground(name)}`}>
    <span className="text-2xl font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  </div>
);

const partners = {
  casino: [
    { name: 'FanDuel Casino', status: 'active' },
    { name: 'DraftKings Casino', status: 'active' },
    { name: 'BetMGM Casino', status: 'active' },
    { name: 'Borgata Casino', status: 'active' },
    { name: 'PokerStars Casino', status: 'active' },
    { name: 'Caesars Casino', status: 'active' },
    { name: 'BetRivers Casino', status: 'active' },
    { name: 'Pulsz Casino', status: 'active' },
    { name: 'McLuck Casino', status: 'active' },
    { name: 'HelloMillions Casino', status: 'active' },
    { name: 'Sports Millions Casino', status: 'active' },
    { name: 'PlayStar Casino (NJ)', status: 'active' },
    { name: 'Jackpot City Casino', status: 'pending' }
  ],
  sportsbook: [
    { name: 'FanDuel Sportsbook', status: 'active' },
    { name: 'DraftKings Sportsbook', status: 'active' },
    { name: 'BetMGM Sportsbook', status: 'active' },
    { name: 'Caesars Sportsbook', status: 'active' }
  ],
  other: [
    { name: 'FanDuel Fantasy', status: 'active' },
    { name: 'DraftKings Fantasy', status: 'active' },
    { name: 'Underdog Fantasy', status: 'active' },
    { name: 'Sleeper Fantasy', status: 'active' },
    { name: 'WSOP Poker', status: 'active' }
  ]
};

const PartnerCard = ({ partner }) => (
  <div className="relative bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-lg font-medium text-gray-900">{partner.name}</h4>
        {partner.status === 'pending' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
            Pending
          </span>
        )}
      </div>
      <div className="h-16 w-16 rounded-lg overflow-hidden">
        {partnerLogos[partner.name] ? (
          <img
            src={partnerLogos[partner.name]}
            alt={partner.name}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : (
          <PartnerInitial name={partner.name} />
        )}
      </div>
    </div>
  </div>
);

const PartnerSection = ({ title, partners }) => (
  <div className="mb-8">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {partners.map((partner) => (
        <PartnerCard key={partner.name} partner={partner} />
      ))}
    </div>
  </div>
);

const AdminPartnersPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Partners</h3>
          <p className="mt-1 text-sm text-gray-500">
            Current and pending casino and sportsbook partners
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            <PartnerSection title="Casino Partners" partners={partners.casino} />
            <PartnerSection title="Sportsbook Partners" partners={partners.sportsbook} />
            <PartnerSection title="Fantasy & Poker Partners" partners={partners.other} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPartnersPage;
