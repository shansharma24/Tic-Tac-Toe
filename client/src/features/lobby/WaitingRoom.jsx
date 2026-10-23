import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Copy, Check, Share2, Loader2, ArrowLeft } from 'lucide-react';

export const WaitingRoom = ({ roomCode, onCancel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Floyd Technology Hub — Tic-Tac-Toe Match',
          text: `Join my Tic-Tac-Toe match on Floyd Technology Hub! Use Room Code: ${roomCode}`,
          url: window.location.href,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <GlassCard glow="cyan" className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>

        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
            Private Room Created
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Waiting for Opponent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Share this room code with a friend to begin playing.
          </p>
        </div>

        {/* Big Room Code Box */}
        <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col items-center justify-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">
            Room Code
          </span>
          <span className="font-mono text-4xl font-black tracking-widest text-cyan-300 select-all">
            {roomCode}
          </span>
        </div>

        {/* Copy & Share Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" size="md" onClick={handleCopy} className="w-full">
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </Button>

          <Button variant="secondary" size="md" onClick={handleShare} className="w-full">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>

        <div className="pt-2 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Leave Room</span>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
