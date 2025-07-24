import React from 'react';

// FanDuel Icon - Using actual image
export const FanDuelIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/FanDuelIcon.png" 
    alt="FanDuel" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// DraftKings Icon - Using actual image
export const DraftKingsIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/draftKingsIcon.png" 
    alt="DraftKings" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Caesars Casino Icon - Using actual image
export const CaesarsCasinoIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/CaesarsCasinoIcon.png" 
    alt="Caesars Casino" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Caesars Sportsbook Icon - Using actual image
export const CaesarsSportsbookIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/caesarsSportsbookIcon.png" 
    alt="Caesars Sportsbook" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Fanatics Icon - Using actual image
export const FanaticsIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/fanaticsIcon.png" 
    alt="Fanatics" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Underdog Fantasy Icon - Using actual image
export const UnderdogIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/underdogLogo1.png" 
    alt="Underdog Fantasy" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// PrizePicks Icon - Using actual image
export const PrizePicksIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/prizepicksLogo.jpeg" 
    alt="PrizePicks" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Legacy Caesars Icon (for backward compatibility) - Using SVG fallback
export const CaesarsIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/CaesarsCasinoIcon.png" 
    alt="Caesars" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// BetMGM Icon - SVG version
export const BetMGMIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C10 2 8 3 7 4C6 3 4 2 3 3C2 4 2 6 3 7C2 8 2 10 3 11C2 12 2 14 3 15C2 16 2 18 3 19C4 20 6 19 7 18C8 19 10 20 12 20C14 20 16 19 17 18C18 19 20 20 21 19C22 18 22 16 21 15C22 14 22 12 21 11C22 10 22 8 21 7C22 6 22 4 21 3C20 2 18 3 17 4C16 3 14 2 12 2z"/>
    <circle cx="8" cy="10" r="1" fill="white"/>
    <circle cx="16" cy="10" r="1" fill="white"/>
    <path d="M12 13C10 13 9 14 9 14C9 14 10 16 12 16C14 16 15 14 15 14C15 14 14 13 12 13z" fill="white"/>
  </svg>
);

// ESPN BET Icon
export const ESPNBetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor"/>
    <path d="M5 9h4v2H7v1h2v2H7v1h2v2H5V9zm5 0h2v8h-2V9zm3 0h4v2h-2v1h2v2h-2v1h2v2h-4V9z" fill="white"/>
  </svg>
);

// PointsBet Icon
export const PointsBetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <path 
      d="M8 8h4c1.1 0 2 .9 2 2s-.9 2-2 2h-2v4H8V8zm2 2v2h2c0-.6 0-2 0-2H10zm6-2h2v8h-2V8z" 
      fill="white"
    />
  </svg>
);

// Bet365 Icon
export const Bet365Icon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
    <path 
      d="M7 7h4c1.1 0 2 .9 2 2v1c0 .6-.3 1.1-.7 1.4.4.3.7.8.7 1.4v1c0 1.1-.9 2-2 2H7V7zm2 2v2h2V9H9zm0 4v2h2v-2H9zm6-6h4v2h-2v6h2v2h-4v-2h2V9h-2V7z" 
      fill="white"
    />
  </svg>
);

// Hard Rock Bet Icon
export const HardRockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path 
      d="M12 6l2 3h3l-2.5 2L16 14l-4-2.5L8 14l1.5-3L7 9h3l2-3z" 
      fill="currentColor"
    />
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

// Barstool Icon
export const BarstoolIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor"/>
    <path 
      d="M8 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-2v5H8V7zm2 2v2h2V9h-2zm6-2h2v9h-2V7z" 
      fill="white"
    />
  </svg>
);

// SuperBook Icon
export const SuperBookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M4 4h16v16H4V4z" 
      fill="currentColor"
    />
    <path 
      d="M7 8h4c.6 0 1 .4 1 1s-.4 1-1 1H9v1h2c.6 0 1 .4 1 1s-.4 1-1 1H7v-5zm0 6h4c.6 0 1 .4 1 1s-.4 1-1 1H7v-2zm7-6h4c1.1 0 2 .9 2 2s-.9 2-2 2h-2v2h-2V8zm2 2v2h2v-2h-2z" 
      fill="white"
    />
  </svg>
);

// WynnBET Icon
export const WynnBetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2L2 12l10 10 10-10L12 2z" 
      fill="currentColor"
    />
    <path 
      d="M8 9l1.5 4L11 9h2l1.5 4L16 9h2l-3 6h-2l-1-3-1 3H9L6 9h2z" 
      fill="white"
    />
  </svg>
);

// BetRivers Icon
export const BetRiversIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <path 
      d="M8 8h4c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-2v3H8V8zm2 2v3h2v-3h-2zm6-2h3l-1.5 3.5L19 16h-2l-1-2.5L15 16h-2l2.5-4.5L14 8h2z" 
      fill="white"
    />
  </svg>
);

// Unibet Icon
export const UnibetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/>
    <path 
      d="M7 9v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V9h-2v4h-2V9H7zm8 0h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-4V9zm2 2v2h2v-2h-2z" 
      fill="white"
    />
  </svg>
);

// Legacy SVG versions for fallback
export const FanDuelIconSVG = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" 
      fill="currentColor" 
      opacity="0.9"
    />
    <path 
      d="M8 8h6v2h-4v2h3v2h-3v3H8V8z" 
      fill="white"
    />
  </svg>
);

export const DraftKingsIconSVG = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M5 20h14v-2H5v2zm2-10l-2 2v6h2v-5.5l1-1 1 1V18h2v-5.5l1-1 1 1V18h2v-5.5l1-1 1 1V18h2v-6l-2-2-2 1-2-1-2 1-2-1z" 
      fill="currentColor"
    />
    <path 
      d="M12 2l-3 3 3 3 3-3-3-3z" 
      fill="currentColor"
    />
  </svg>
);

export const CaesarsIconSVG = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2C10.5 2 9 3 8 4.5C7 3 5.5 2 4 2C3 2 2 2.5 2 3.5C2 5 3 6 3 7.5C3 9 2 10 2 11.5C2 13 3 14 3 15.5C3 17 2 18 2 19.5C2 20.5 3 21 4 21C5.5 21 7 20 8 18.5C9 20 10.5 21 12 21C13.5 21 15 20 16 18.5C17 20 18.5 21 20 21C21 21 22 20.5 22 19.5C22 18 21 17 21 15.5C21 14 22 13 22 11.5C22 10 21 9 21 7.5C21 6 22 5 22 3.5C22 2.5 21 2 20 2C18.5 2 17 3 16 4.5C15 3 13.5 2 12 2z" 
      fill="currentColor"
      opacity="0.2"
    />
    <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.9"/>
    <path 
      d="M12 8C10 8 8.5 9.5 8.5 12C8.5 14.5 10 16 12 16C13 16 13.5 15.5 13.5 15.5C13.5 15.5 13 15 12 15C11 15 10 14 10 12C10 10 11 9 12 9C13 9 13.5 8.5 13.5 8.5C13.5 8.5 13 8 12 8z" 
      fill="white"
    />
  </svg>
);

export const FanaticsIconSVG = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" 
      fill="currentColor"
    />
    <path 
      d="M7 8h10v2H9v2h6v2H9v3H7V8z" 
      fill="white"
    />
  </svg>
);