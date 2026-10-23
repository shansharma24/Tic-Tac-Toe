import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Sparkles,
  KeyRound,
  PlusCircle,
  Trophy,
  History,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const LobbyView = ({
  onCreateRoom,
  onJoinRoom,
  onViewLeaderboard,
  onViewHistory,
  onOpenHowToPlay,
  creating = false,
  joining = false,
  error = '',
}) => {
  const { player } = useAuth();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [localError, setLocalError] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setLocalError('Please enter a valid room code.');
      return;
    }
    setLocalError('');
    onJoinRoom(cleanCode);
  };

  const displayedError = error || localError;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Floyd Technology Hub • Competitive Gaming Arena</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          One Grid. Two Players.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
            One Winner.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Challenge a friend in real-time Tic-Tac-Toe. Create a room, share the code, and let the match begin.
        </p>
      </div>

      {/* Global Error Banner */}
      {displayedError && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {/* Action Cards: Create Room & Join Room */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Create Private Room Card */}
        <GlassCard
          glow="cyan"
          hoverEffect
          className="flex flex-col justify-between space-y-6 relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Create Private Room</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Host a new game room, get an instant invitation code, and assign yourself the first move as player{' '}
              <span className="text-cyan-400 font-bold">X</span>.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              loading={creating}
              disabled={creating || joining}
              onClick={onCreateRoom}
              className="w-full"
            >
              <span>Host New Match</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>

        {/* Join Room Card */}
        <GlassCard
          glow="violet"
          hoverEffect
          className="flex flex-col justify-between space-y-6 relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Join Existing Room</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enter a 6-character room code sent by a friend to step in as player{' '}
              <span className="text-pink-500 font-bold">O</span>.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3 pt-2">
            <div className="relative">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => {
                  setRoomCodeInput(e.target.value.toUpperCase());
                  if (localError) setLocalError('');
                }}
                placeholder="Enter 6-digit Code (e.g. 7K2M9P)"
                maxLength={10}
                disabled={joining || creating}
                className="w-full glass-input px-4 py-3 rounded-xl font-mono text-center tracking-widest text-base font-bold placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              loading={joining}
              disabled={joining || creating || !roomCodeInput.trim()}
              className="w-full"
            >
              <span>Join Match</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </GlassCard>
      </div>

      {/* Feature & Stats Banner */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={onViewLeaderboard}
          className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-400/40 hover:bg-slate-800/60 transition-all text-left group cursor-pointer"
        >
          <Trophy className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-bold text-white">Leaderboards</h4>
          <p className="text-xs text-slate-400">View global rankings</p>
        </button>

        <button
          onClick={onViewHistory}
          className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-400/40 hover:bg-slate-800/60 transition-all text-left group cursor-pointer"
        >
          <History className="w-5 h-5 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-bold text-white">Match History</h4>
          <p className="text-xs text-slate-400">Interactive replays</p>
        </button>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-left">
          <Zap className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Zero Latency</h4>
          <p className="text-xs text-slate-400">Socket.IO real time</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Server-Authoritative</h4>
          <p className="text-xs text-slate-400">Full anti-cheat integrity</p>
        </div>
      </div>
    </div>
  );
};
