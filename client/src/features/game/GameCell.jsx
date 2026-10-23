import React from 'react';

export const GameCell = ({
  index,
  value, // '' | 'X' | 'O'
  isWinningCell = false,
  isLastMove = false,
  isMyTurn = false,
  disabled = false,
  onClick,
}) => {
  const isOccupied = !!value;
  const canClick = !isOccupied && isMyTurn && !disabled;

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={`Cell ${index + 1}: ${value ? `occupied by ${value}` : 'empty'}`}
      disabled={!canClick}
      onClick={() => canClick && onClick(index)}
      className={`relative w-22 h-22 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
        isWinningCell
          ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] z-10 animate-pulse'
          : isLastMove
          ? 'bg-white/10 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
          : 'bg-slate-900/60 hover:bg-slate-800/60 border border-white/10'
      } ${
        !canClick && !isOccupied ? 'cursor-not-allowed opacity-75' : ''
      } ${
        canClick ? 'hover:scale-[1.03] active:scale-[0.97] hover:border-cyan-400/40' : ''
      }`}
    >
      {/* Subtly show last move badge */}
      {isLastMove && !isWinningCell && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
      )}

      {/* Render X Mark */}
      {value === 'X' && (
        <svg
          viewBox="0 0 64 64"
          className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400 filter drop-shadow-[0_0_12px_rgba(0,240,255,0.7)] animate-in zoom-in-50 duration-200"
          fill="none"
        >
          <line
            x1="14"
            y1="14"
            x2="50"
            y2="50"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="14"
            x2="14"
            y2="50"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Render O Mark */}
      {value === 'O' && (
        <svg
          viewBox="0 0 64 64"
          className="w-12 h-12 sm:w-16 sm:h-16 text-pink-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-in zoom-in-50 duration-200"
          fill="none"
        >
          <circle
            cx="32"
            cy="32"
            r="20"
            stroke="currentColor"
            strokeWidth="7"
          />
        </svg>
      )}

      {/* Ghost hover preview for current turn if empty and allowed */}
      {!value && canClick && (
        <span className="opacity-0 hover:opacity-20 text-3xl font-black text-cyan-300 transition-opacity">
          +
        </span>
      )}
    </button>
  );
};
