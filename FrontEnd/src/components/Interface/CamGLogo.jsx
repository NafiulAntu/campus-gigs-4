import React from "react";

export default function CamGLogo({ width = 140, height = 40, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#00A8F3" />
          <stop offset="100%" stopColor="#00C4CC" />
        </linearGradient>
        <filter
          id="s"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="4"
            floodColor="#000"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* mark / icon */}
      <g transform="translate(10,10)" filter="url(#s)">
        <rect x="0" y="0" width="60" height="60" rx="12" fill="url(#g1)" />
        <g transform="translate(10,10)" fill="#fff">
          <path d="M20 0c2 0 4 1 5 2l3 3 3-3c1-1 3-2 5-2 4 0 8 4 8 8v2c0 5-4 10-8 12-4 2-8 5-8 9v3H15v-3c0-4-4-7-8-9-4-2-8-7-8-12v-2c0-4 4-8 8-8 2 0 4 1 5 2l3 3 3-3c1-1 3-2 5-2z" />
        </g>
      </g>

      {/* text CamG */}
      <g transform="translate(92,44)">
        <text
          x="0"
          y="0"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="28"
          fontWeight="700"
          fill="#E6F9FB"
        >
          Cam
        </text>
        <text
          x="72"
          y="0"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="28"
          fontWeight="700"
          fill="url(#g1)"
        >
          G
        </text>
      </g>
    </svg>
  );
}
