import React from 'react';

export const Logo = ({ size = 'default', showSubtitle = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer select-none group transition-all duration-300 ${
        onClick ? 'hover:opacity-90' : ''
      }`}
    >
      {/* Geometric X/O Grid Icon */}
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-background border border-cyan-500/30 shadow-glass flex items-center justify-center p-2 overflow-hidden group-hover:border-cyan-400/60 transition-colors">
        <div className="absolute inset-0 bg-cyan-500/10 blur-sm group-hover:bg-cyan-500/20 transition-all" />
        
        {/* Subtle Mini Grid */}
        <div className="relative w-full h-full grid grid-cols-2 grid-rows-2 gap-1 items-center justify-items-center">
          {/* Top-Left X */}
          <span className="text-[11px] font-black text-cyan-400 leading-none">✕</span>
          {/* Top-Right Violet Accent Dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
          {/* Bottom-Left Cyan Accent Dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          {/* Bottom-Right O */}
          <span className="text-[11px] font-black text-pink-500 leading-none">◯</span>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-white text-lg sm:text-xl font-sans">
            Floyd
          </span>
          <span className="font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent text-lg sm:text-xl">
            Technology Hub
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400 -mt-1 font-medium">
            Multiplayer Arena
          </span>
        )}
      </div>
    </div>
  );
};
