// Platform Categories
export const PLATFORM_CATEGORIES = {
  ALL: 'ALL',
  FANTASY: 'FANTASY',
  CASINO: 'CASINO',
  SPORTS: 'SPORTS',
  SWEEPS_CASINO: 'SWEEPS_CASINO'
};

// Fixed image mappings based on actual files in public/images
const IMAGE_MAPPINGS = {
  // Fantasy
  'draftkings': 'draftkings.png',
  'draftkingsfantasy': 'draftkingsFantasy.png',
  'fanduel': 'fanduel.png',
  'sleeper': 'sleeper.png',
  'espnfantasy': 'espnFantasy.png',
  'prizepicks': 'prizepicks.png',
  'underdog': 'underdog.jpeg',
  'betr': 'betr.png',
  'betrfantasy': 'betrFantasy.png',
  'yahoofantasy': 'yahoofantasy.png',
  
  // Sportsbook
  'betmgm': 'betmgm.png',
  'caesars': 'caesars.png',
  'betrivers': 'betRivers.png',
  'espnbet': 'espnBet.png',
  'fanatics': 'fanatics.png',
  
  // Casino
  'pokerstars': 'pokerstars.png',
  'draftkingscasino': 'draftkingsCasino.jpeg',
  'fanduelcasino': 'fanduelCasino.jpg',
  'betmgmcasino': 'betmgm.png', // Same as sportsbook
  'caesarscasino': 'caesarsCasino.png',
  'borgata': 'BorgataPoker.png',
  'playstar': 'playstar.png',
  
  // Sweeps
  'mcluck': 'mcluck.png',
  'pulsz': 'pulsz.png',
  'hellomillions': 'hellomillions.png',
  'wowvegas': 'wowvegas.png',
  'high5': 'high5.png',
  'realprize': 'realprize.webp',
  'crowncoins': 'crowncoins.png',
  'stake': 'Stake.jpg',
  'carnivalciti': 'carnivalciti.jpg',
  'jackpota': 'jackpota.png',
  'nolimit': 'nolimit.png',
  'megabonanza': 'megabonanza.webp',
  'moonspin': 'moonspin.jpg',
  'moneyfactory': 'moneyfactory.webp',
  'luckybird': 'luckybird.png',
  'funrize': 'funrize.webp',
  'fortunewheelz': 'fortunewheelz.png',
  'funzcity': 'funzcity.webp',
  'chumba': 'chumba.png',
  'luckyland': 'luckyland.png',
};

// Helper function to get correct image file
export const getPlatformImage = (platformId) => {
  const normalizedId = platformId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return IMAGE_MAPPINGS[normalizedId] || null;
};

// All available platforms with standardized $0.50 value and FIXED image references
export const ALL_PLATFORMS = [
  // Featured Partners
  {
    id: 'playstar',
    name: 'PlayStar Casino NJ',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'playstar.png',
    gradientStart: '#FBBF24',
    gradientEnd: '#D97706',
    promoOffer: '100% Deposit Match up to $500 + 500 Bonus Spins',
    url: 'https://click.trackplaystar.com/track/314f996a-668d-400d-8c9b-97d28c3fde31?type=seo&s1=662608032',
    allowedStates: ['NJ'],
    allowedCountries: ['US'],
    ageRequirement: 21,
    locationSpecificOffers: {
      'NJ': {
        promoOffer: '100% Deposit Match up to $500 + 500 Bonus Spins',
        disclaimer: 'New Jersey residents only. Must be 21+. Gambling Problem? Call 1-800-GAMBLER.'
      }
    }
  },
  {
    id: 'mcluck',
    name: 'McLuck',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'mcluck.png',
    gradientStart: '#FFD700',
    gradientEnd: '#B8860B',
    url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5356&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid',
    restrictedStates: ['WA', 'ID', 'MT', 'NV'],
    allowedCountries: ['US'],
    ageRequirement: 18
  },
  {
    id: 'pulsz',
    name: 'Pulsz',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'pulsz.png',
    gradientStart: '#FCD34D',
    gradientEnd: '#F59E0B',
    url: 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=142603201&utm_campaign=lhr&utm_creative=142603201&referred_by=BONUSPLAY&corid',
    restrictedStates: ['WA', 'ID', 'MT', 'NV'],
    allowedCountries: ['US'],
    ageRequirement: 18
  },
  {
    id: 'hellomillions',
    name: 'HelloMillions',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'hellomillions.png',
    gradientStart: '#FCD34D',
    gradientEnd: '#F59E0B',
    url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5357&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BONUSPLAY&corid',
    restrictedStates: ['WA', 'ID', 'MT', 'NV'],
    allowedCountries: ['US'],
    ageRequirement: 18
  },
  // Fantasy Partners
  {
    id: 'draftkings',
    name: 'DraftKings',
    category: PLATFORM_CATEGORIES.FANTASY,
    value: 0.50,
    imageFile: 'draftkingsFantasy.png', // Fixed case
    gradientStart: '#FBBF24',
    gradientEnd: '#D97706',
    restrictedStates: ['WA', 'ID', 'MT', 'NV', 'AZ', 'LA', 'HI'],
    allowedCountries: ['US'],
    ageRequirement: 18
  },
  {
    id: 'fanduel',
    name: 'FanDuel',
    category: PLATFORM_CATEGORIES.FANTASY,
    value: 0.50,
    imageFile: 'fanduel.png',
    gradientStart: '#60A5FA',
    gradientEnd: '#2563EB',
    restrictedStates: ['WA', 'ID', 'MT', 'NV', 'AZ', 'LA', 'HI'],
    allowedCountries: ['US'],
    ageRequirement: 18
  },
  {
    id: 'sleeper',
    name: 'Sleeper',
    category: PLATFORM_CATEGORIES.FANTASY,
    value: 0.50,
    imageFile: 'sleeper.png',
    gradientStart: '#34D399',
    gradientEnd: '#059669'
  },
  {
    id: 'espnfantasy',
    name: 'ESPN Fantasy',
    category: PLATFORM_CATEGORIES.FANTASY,
    value: 0.50,
    imageFile: 'espnFantasy.png', // Fixed case
    gradientStart: '#F87171',
    gradientEnd: '#DC2626'
  },
  {
    id: 'prizepicks',
    name: 'PrizePicks',
    category: PLATFORM_CATEGORIES.FANTASY,
    value: 0.50,
    imageFile: 'prizepicks.png',
    gradientStart: '#A78BFA',
    gradientEnd: '#7C3AED',
    allowedStates: ['AK', 'CA', 'FL', 'GA', 'IL', 'KS', 'KY', 'MN', 'NE', 'NM', 'NC', 'OK', 'OR', 'RI', 'SC', 'SD', 'TX', 'UT', 'VT', 'WI', 'WY'],
    allowedCountries: ['US'],
    ageRequirement: 18
  },
  // Casino Partners
  {
    id: 'pokerstars',
    name: 'PokerStars',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'pokerstars.png',
    gradientStart: '#F472B6',
    gradientEnd: '#DB2777',
    allowedStates: ['MI', 'NJ', 'PA'],
    allowedCountries: ['US'],
    ageRequirement: 21
  },
  // Sports Partners
  {
    id: 'betmgm',
    name: 'BetMGM',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'betmgm.png',
    gradientStart: '#818CF8',
    gradientEnd: '#4F46E5',
    allowedStates: ['AZ', 'CO', 'IA', 'IL', 'IN', 'KS', 'LA', 'MD', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV', 'WY', 'DC', 'NV', 'OR'],
    allowedCountries: ['US'],
    ageRequirement: 21
  },
  {
    id: 'caesars',
    name: 'Caesars',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'caesars.png',
    gradientStart: '#FCD34D',
    gradientEnd: '#F59E0B',
    allowedStates: ['AZ', 'CO', 'IA', 'IL', 'IN', 'KS', 'LA', 'MD', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV', 'WY', 'DC', 'NV'],
    allowedCountries: ['US'],
    ageRequirement: 21
  },
  {
    id: 'underdog',
    name: 'Underdog',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'underdog.jpeg',
    gradientStart: '#FB7185',
    gradientEnd: '#E11D48'
  },
  {
    id: 'betr',
    name: 'Betr',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'betr.png',
    gradientStart: '#2DD4BF',
    gradientEnd: '#0D9488'
  },
  {
    id: 'betrivers',
    name: 'BetRivers',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'betRivers.png', // Fixed case
    gradientStart: '#94A3B8',
    gradientEnd: '#475569'
  },
  {
    id: 'wynnbet',
    name: 'WynnBet',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: null, // Missing - will use initials
    gradientStart: '#C084FC',
    gradientEnd: '#9333EA'
  },
  // Sweeps Casino Partners
  {
    id: 'wowvegas',
    name: 'WOW Vegas',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'wowvegas.png',
    gradientStart: '#F472B6',
    gradientEnd: '#DB2777',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'high5',
    name: 'High 5',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'high5.png',
    gradientStart: '#818CF8',
    gradientEnd: '#4F46E5',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'realprize',
    name: 'RealPrize',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'realprize.webp',
    gradientStart: '#FBBF24',
    gradientEnd: '#D97706',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'crowncoins',
    name: 'Crown Coins',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'crowncoins.png',
    gradientStart: '#FCD34D',
    gradientEnd: '#F59E0B',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'stake',
    name: 'Stake',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'Stake.jpg', // Fixed case
    gradientStart: '#A78BFA',
    gradientEnd: '#7C3AED',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'carnivalciti',
    name: 'Carnival Citi',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'carnivalciti.jpg',
    gradientStart: '#FB7185',
    gradientEnd: '#E11D48',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'jackpota',
    name: 'Jackpota',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'jackpota.png',
    gradientStart: '#C084FC',
    gradientEnd: '#9333EA',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'nolimit',
    name: 'NoLimit',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'nolimit.png',
    gradientStart: '#F87171',
    gradientEnd: '#DC2626',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'megabonanza',
    name: 'Megabonanza',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'megabonanza.webp',
    gradientStart: '#94A3B8',
    gradientEnd: '#475569',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'moonspin',
    name: 'Moonspin',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'moonspin.jpg',
    gradientStart: '#F472B6',
    gradientEnd: '#DB2777',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'moneyfactory',
    name: 'Money Factory',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'moneyfactory.webp',
    gradientStart: '#818CF8',
    gradientEnd: '#4F46E5',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'luckybird',
    name: 'Luckybird',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'luckybird.png',
    gradientStart: '#2DD4BF',
    gradientEnd: '#0D9488',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'funrize',
    name: 'Funrize',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'funrize.webp',
    gradientStart: '#FBBF24',
    gradientEnd: '#D97706',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'fortunewheelz',
    name: 'Fortune Wheelz',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'fortunewheelz.png',
    gradientStart: '#60A5FA',
    gradientEnd: '#2563EB',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'funzcity',
    name: 'FunzCity',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'funzcity.webp',
    gradientStart: '#FCD34D',
    gradientEnd: '#F59E0B',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'chumba',
    name: 'Chumba',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'chumba.png',
    gradientStart: '#A78BFA',
    gradientEnd: '#7C3AED',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'luckyland',
    name: 'Luckyland',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'luckyland.png',
    gradientStart: '#FB7185',
    gradientEnd: '#E11D48',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'betriversnet',
    name: 'BetRivers.Net',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: 'betrivers.jpg',
    gradientStart: '#C084FC',
    gradientEnd: '#9333EA',
    disabled: true,
    disabledText: 'Coming Soon'
  },
  {
    id: 'sportsmillions',
    name: 'Sports Millions',
    category: PLATFORM_CATEGORIES.SWEEPS_CASINO,
    value: 0.50,
    imageFile: null, // Missing - will use initials
    gradientStart: '#F472B6',
    gradientEnd: '#DB2777',
    url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid',
    disabled: true,
    disabledText: 'Coming Soon'
  }
];

// Casino-specific platforms for the casino pages
export const CASINO_PLATFORMS = [
  {
    id: 'draftkings-casino',
    name: 'DraftKings Casino',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'draftkingsCasino.jpeg',
    gradientStart: '#FBBF24',
    gradientEnd: '#D97706',
    url: 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079'
  },
  {
    id: 'fanduel-casino',
    name: 'FanDuel Casino',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'fanduelCasino.jpg',
    gradientStart: '#60A5FA',
    gradientEnd: '#2563EB',
    url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42627b_50c_&affid=5594&siteid=42627&adid=50&c=662608032'
  },
  {
    id: 'fanatics-casino',
    name: 'Fanatics Casino',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'fanatics.png',
    gradientStart: '#34D399',
    gradientEnd: '#059669',
    url: 'https://casino.fanatics.com'
  },
  {
    id: 'betmgm-casino',
    name: 'BetMGM Casino',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'betmgm.png',
    gradientStart: '#818CF8',
    gradientEnd: '#4F46E5',
    url: 'https://casino.betmgm.com'
  },
  {
    id: 'caesars-casino',
    name: 'Caesars Casino',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'caesarsCasino.png',
    gradientStart: '#FCD34D',
    gradientEnd: '#F59E0B',
    url: 'https://casino.caesars.com'
  },
  {
    id: 'borgata',
    name: 'Borgata Casino',
    category: PLATFORM_CATEGORIES.CASINO,
    value: 0.50,
    imageFile: 'BorgataPoker.png',
    gradientStart: '#F472B6',
    gradientEnd: '#DB2777',
    url: 'https://casino.borgataonline.com'
  }
];

// Sportsbook-specific platforms
export const SPORTSBOOK_PLATFORMS = [
  {
    id: 'draftkings-sportsbook',
    name: 'DraftKings Sportsbook',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'draftkings.png',
    gradientStart: '#FBBF24',
    gradientEnd: '#D97706',
    url: 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079'
  },
  {
    id: 'fanduel-sportsbook',
    name: 'FanDuel Sportsbook',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'fanduel.png',
    gradientStart: '#60A5FA',
    gradientEnd: '#2563EB',
    url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42626b_16c_&affid=5594&siteid=42626&adid=16&c=662608032'
  },
  {
    id: 'fanatics-sportsbook',
    name: 'Fanatics Sportsbook',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'fanatics.png',
    gradientStart: '#34D399',
    gradientEnd: '#059669',
    url: 'https://track.fanaticsbettingpartners.com/track/d2ed08a4-86b2-4b78-8e8b-37ba1c9a20dd?type=seo&s1=662608032'
  },
  {
    id: 'espn-bet',
    name: 'ESPN BET',
    category: PLATFORM_CATEGORIES.SPORTS,
    value: 0.50,
    imageFile: 'espnBet.png',
    gradientStart: '#F87171',
    gradientEnd: '#DC2626',
    url: 'https://espnbet.com'
  }
];