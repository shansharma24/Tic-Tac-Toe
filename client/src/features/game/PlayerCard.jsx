import React from 'react';

export const PlayerCard = ({
  player,
  mark,
  isCurrentTurn = false,
  isLocalPlayer = false,
  score = 0,
  reconnectingCountdown = null,
}) => {
  const isX = mark === 'X';
  const isConnected = player?.connected !== false;

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
        isCurrentTurn
          ? isX
            ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
            : 'bg-slate-900/90 border-2 border-pink-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
          : 'bg-slate-900/50 border border-white/10 opacity-80'
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Avatar with Mark Badge */}
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-slate-950 shadow-md ${
              isX
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-500'
                : 'bg-gradient-to-tr from-pink-500 to-violet-600'
            }`}
          >
            {player?.nickname ? player.nickname.charAt(0).toUpperCase() : '?'}
          </div>

          {/* Mark Pill */}
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-md border ${
              isX
                ? 'bg-slate-950 text-cyan-400 border-cyan-400'
                : 'bg-slate-950 text-pink-500 border-pink-500'
            }`}
          >
            {mark}
          </span>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white truncate">
              {player?.nickname || (mark === 'X' ? 'Creator' : 'Waiting...')}
            </h4>
            {isLocalPlayer && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                YOU
              </span>
            )}
          </div>

          {/* Connection Status & Turn info */}
          <div className="flex items-center gap-2 mt-1">
            {isConnected ? (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>
                  Reconnecting {reconnectingCountdown ? `(${reconnectingCountdown}s)` : ''}
                </span>
              </div>
            )}

            {isCurrentTurn && (
              <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                Thinking...
              </span>
            )}
          </div>
        </div>

        {/* Series Score Badge */}
        <div className="text-right pl-2 border-l border-white/10">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            Wins
          </span>
          <span className="text-xl font-black font-mono text-white leading-none">
            {score}
          </span>
        </div>
      </div>
    </div>
  );
};
