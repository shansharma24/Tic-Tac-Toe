import React from 'react';

export const WinningLine = ({ winningLine = [] }) => {
  if (!winningLine || winningLine.length !== 3) return null;

  // Determine line coordinates in 0..100 percentage space
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

  const key = winningLine.slice().sort().join(',');

  switch (key) {
    // Rows
    case '0,1,2':
      x1 = 5; y1 = 16.66; x2 = 95; y2 = 16.66;
      break;
    case '3,4,5':
      x1 = 5; y1 = 50; x2 = 95; y2 = 50;
      break;
    case '6,7,8':
      x1 = 5; y1 = 83.33; x2 = 95; y2 = 83.33;
      break;

    // Columns
    case '0,3,6':
      x1 = 16.66; y1 = 5; x2 = 16.66; y2 = 95;
      break;
    case '1,4,7':
      x1 = 50; y1 = 5; x2 = 50; y2 = 95;
      break;
    case '2,5,8':
      x1 = 83.33; y1 = 5; x2 = 83.33; y2 = 95;
      break;

    // Diagonals
    case '0,4,8':
      x1 = 10; y1 = 10; x2 = 90; y2 = 90;
      break;
    case '2,4,6':
      x1 = 90; y1 = 10; x2 = 10; y2 = 90;
      break;

    default:
      return null;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="url(#winGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#neonGlow)"
        className="animate-in fade-in duration-300"
      />
    </svg>
  );
};
