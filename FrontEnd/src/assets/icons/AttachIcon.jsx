import React from 'react';

const AttachIcon = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M21.44 11.05l-9.19 9.19a5.64 5.64 0 01-7.98-7.98l9.19-9.19a4 4 0 015.66 5.66L9.93 16.92a2.25 2.25 0 11-3.18-3.18l8.13-8.13" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AttachIcon;
