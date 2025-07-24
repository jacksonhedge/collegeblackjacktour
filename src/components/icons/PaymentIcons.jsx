import React from 'react';

// Bank/ACH Icon
export const BankIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm12-12v7h3v-7h-3zm-2.5-9L2 6v2h19V6l-9.5-5z"/>
  </svg>
);

// Venmo Icon - Using actual image
export const VenmoIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/VenmoIcon.png" 
    alt="Venmo" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Apple Pay Icon - Using actual image
export const ApplePayIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/ApplePayIcon.png" 
    alt="Apple Pay" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Visa Icon - Using actual image
export const VisaIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/VisaIcon.svg" 
    alt="Visa" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Mastercard Icon - Using actual image
export const MastercardIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/masterCard.png" 
    alt="Mastercard" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Crypto/Bitcoin Icon
export const CryptoIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.5 11.5v-2c1.1 0 2-.45 2-1s-.9-1-2-1v-2c1.1 0 2-.45 2-1s-.9-1-2-1v-1.5h-1v1.5c-1.1 0-2 .45-2 1s.9 1 2 1v2c-1.1 0-2 .45-2 1s.9 1 2 1v2c-1.1 0-2 .45-2 1s.9 1 2 1v2c-1.1 0-2 .45-2 1s.9 1 2 1V23h1v-1.5c1.1 0 2-.45 2-1s-.9-1-2-1v-2c1.1 0 2-.45 2-1s-.9-1-2-1v-2c1.1 0 2-.45 2-1s-.9-1-2-1zm0 2v2c-.55 0-1-.22-1-.5s.45-.5 1-.5zm0-6v2c-.55 0-1-.22-1-.5s.45-.5 1-.5zm0 10v2c-.55 0-1-.22-1-.5s.45-.5 1-.5zm1 4c0 .28-.45.5-1 .5v-2c.55 0 1 .22 1 .5zm0-4c0 .28-.45.5-1 .5v-2c.55 0 1 .22 1 .5zm0-4c0 .28-.45.5-1 .5v-2c.55 0 1 .22 1 .5zm0-4c0 .28-.45.5-1 .5v-2c.55 0 1 .22 1 .5zm0-4c0 .28-.45.5-1 .5v-2c.55 0 1 .22 1 .5z"/>
  </svg>
);

// Round-ups (SideBet) Icon - Using actual image
export const RoundUpsIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/sidebet-favicon.png" 
    alt="SideBet by Hedge Pay" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Meld Banking Icon - Using actual image
export const MeldIcon = ({ className = "w-6 h-6" }) => (
  <img 
    src="/images/Meld.png" 
    alt="Meld" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// FanDuel Icon
export const FanDuelIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M8.5 7.5v9h2v-3.5h3v-2h-3v-1.5h4v-2h-6zm8 0h-2v9h2v-9z"/>
  </svg>
);

// DraftKings Icon
export const DraftKingsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.89v3.93c0 4.28-2.88 8.24-7 9.68-4.12-1.44-7-5.4-7-9.68V8.07l7-3.89z"/>
    <path d="M12 5.5L5.5 9v3c0 3.61 2.49 6.98 5.5 8.19V5.5zm1 0v14.69c3.01-1.21 5.5-4.58 5.5-8.19V9L13 5.5z"/>
  </svg>
);

// Caesars Icon
export const CaesarsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-2 4-4 .5 3 3-.5 4 3.5-2 3.5 2-.5-4 3-3-4-.5z"/>
    <path d="M5 14v6c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-6H5zm3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

// BetMGM Icon
export const BetMGMIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
    <path d="M7 7h4v10H7V7zm6 0h4v10h-4V7z"/>
    <path d="M8.5 9v6h1V9h-1zm6 0v6h1V9h-1z"/>
    <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

// ESPN BET Icon
export const ESPNBetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 6v12h20V6H2zm18 10H4V8h16v8z"/>
    <path d="M6 10v4h2v-1h2v-1H8v-1h2V10H6zm5 0v4h2v-1h1v1h2v-1h-1v-1h1v-1h-1v-1h1V10h-2v1h-1V10h-2zm6 0v4h2v-3h1v3h1V10h-4z"/>
  </svg>
);

// Fanatics Icon
export const FanaticsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M8 8v8h2v-3h4v-2h-4V10h5V8H8zm8 0v8h2V8h-2z"/>
  </svg>
);

// PointsBet Icon
export const PointsBetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M8 8v8h2v-3h2c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2H8zm2 2h2v1h-2v-1zm6-2v8h2V8h-2z"/>
  </svg>
);

// Bet365 Icon
export const Bet365Icon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4v16h16V4H4zm14 14H6V6h12v12z"/>
    <path d="M8 8v2h3v1H8v2h3v1H8v2h5v-1h-2v-1h2v-2h-2v-1h2V8H8zm6 0v8h3v-2h-1v-4h1V8h-3z"/>
  </svg>
);

// Hard Rock Bet Icon
export const HardRockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7l1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5L12 7z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

// Cash App Icon
export const CashAppIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z"/>
    <path d="M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
    <path d="M7 7h2v2H7zm8 0h2v2h-2zm-8 8h2v2H7zm8 0h2v2h-2z"/>
  </svg>
);

// PayPal Icon
export const PayPalIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 6.5c0 3-2.5 5.5-5.5 5.5h-2l-1 6H7l3-18h6c3 0 5.5 2.5 5.5 5.5 0 .5-.1 1-.2 1.5h-1.8zm-4.5 3c1.4 0 2.5-1.1 2.5-2.5S16.4 4.5 15 4.5h-2.2l-.8 5H14z"/>
    <path d="M11.5 15h-2l-.5 3H5l2-12h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-.5zm-.3-2H12c1.1 0 2-.9 2-2s-.9-2-2-2h-1.6l-.7 4z"/>
  </svg>
);

// Zelle Icon
export const ZelleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M15 8h-5l-2 2h5l-5 6h7l2-2h-5l5-6z"/>
  </svg>
);

// Wire Transfer Icon
export const WireIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12h4m16 0h-4m-6-8v4m0 16v-4"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M9 9l6 6m0-6l-6 6"/>
  </svg>
);

// Legacy SVG versions for fallback
export const VenmoIconSVG = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.94 9.72c.17.27.24.54.24.89 0 1.17-1.07 2.77-1.93 3.88H.49L0 11.86l1.35-.09.29 1.78c.36-.56.89-1.46.89-2.06 0-.31-.05-.54-.13-.73l1.54-.84v-.2zm7.16.04c0 1.65-1.15 2.93-2.73 2.93-1.05 0-1.59-.48-1.59-1.16 0-.64.48-.99 1.18-.99.29 0 .49.05.67.1-.02-.36-.38-.52-.77-.52-.49 0-.91.12-1.18.24l-.2-1.2c.32-.16.91-.31 1.53-.31 1.31 0 1.94.62 1.94 1.81v2.32c-.29.2-.94.41-1.59.41-.46 0-.83-.14-.96-.29-.17.17-.48.29-.84.29-.72 0-1.3-.48-1.3-1.25 0-.86.7-1.68 2.13-1.68.12 0 .24.02.36.02v-.07c0-.38-.24-.52-.67-.52-.38 0-.79.1-1.05.19l-.17-.96c.29-.12.82-.24 1.44-.24 1.15 0 1.73.41 1.73 1.37v1.74zm-1.97.19c-.05 0-.1-.02-.17-.02-.5 0-.82.26-.82.6 0 .24.14.38.36.38.34 0 .63-.29.63-.7v-.26zm4.39-2.11c.48 0 .91.07 1.18.19v3.25c0 .94-.48 1.49-1.46 1.49-.41 0-.86-.1-1.13-.24V7.88c.26-.12.77-.26 1.41-.26zm-.02 3.74c.14.02.26.05.38.05.31 0 .46-.14.46-.52V8.8c-.1-.02-.22-.05-.36-.05-.41 0-.48.12-.48.46v2.38zM15.48 7.88c.36-.17.96-.29 1.51-.29.72 0 1.15.22 1.37.67.26-.34.72-.67 1.37-.67.94 0 1.32.52 1.32 1.44v2.56c0 .91-.41 1.37-1.25 1.37-.41 0-.86-.12-1.15-.26v-2.4c0-.38-.1-.55-.38-.55s-.43.17-.43.55v2.84h-1.37v-2.84c0-.38-.1-.55-.38-.55s-.43.17-.43.55v2.4c-.29.14-.74.26-1.15.26-.84 0-1.25-.46-1.25-1.37V10.15c0-.91.38-1.44 1.32-1.44.65 0 1.1.34 1.37.67.22-.46.65-.67 1.37-.67.55 0 1.15.12 1.51.29v.94c-.31-.17-.7-.26-1.03-.26-.31 0-.48.14-.48.52v2.33c0 .38.14.52.46.52.14 0 .26-.02.38-.05V10.2c0-.38-.14-.52-.48-.52-.34 0-.53.19-.53.55v-.84zm7.28 2.52c0 .7-.55 1.25-1.27 1.25-.72 0-1.27-.55-1.27-1.25s.55-1.25 1.27-1.25c.72 0 1.27.55 1.27 1.25z"/>
  </svg>
);

export const ApplePayIconSVG = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 8.5c-.3 0-.5-.1-.8-.1-.8 0-1.5.4-1.8 1-.1-.1-.2-.2-.4-.3-.5-.3-1.1-.5-1.7-.5-1.1 0-2.1.5-2.7 1.3V8.7h-1.5v7.2h1.5v-4.1c0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6v4.1h1.5v-4.1c0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6v4.1H22v-4.6c0-1.5-1.1-2.8-2.5-2.8zM7.6 11.9c0-.5-.1-.9-.2-1.3-.3-.8-.9-1.4-1.7-1.7-.4-.2-.9-.2-1.4-.2H2v7.2h1.5v-2.5h.7c.5 0 1 0 1.4-.2.8-.3 1.4-.9 1.7-1.7.2-.5.3-1 .3-1.6zm-2.1.1c0 .2 0 .5-.1.7-.1.3-.3.5-.5.7-.3.2-.6.2-.9.2h-.5v-3h.5c.3 0 .6 0 .9.2.2.1.4.3.5.6.1.2.1.4.1.6z"/>
  </svg>
);