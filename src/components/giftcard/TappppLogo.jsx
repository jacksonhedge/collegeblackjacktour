import React from 'react';

const TappppLogo = ({ className = "h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="50"
      y="25"
      fontFamily="Arial"
      fontSize="20"
      fontWeight="bold"
      fill="#FFFFFF"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      TAPPPP
    </text>
  </svg>
);

export default TappppLogo;
