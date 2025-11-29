import React from 'react';
import './PremiumBadge.css';

const PremiumBadge = ({ size = 'medium', showText = true }) => {
  return (
    <div className={`premium-badge ${size}`}>
      <svg 
        className="badge-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="url(#premium-gradient)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
      {showText && <span className="badge-text">Premium</span>}
    </div>
  );
};

export default PremiumBadge;
