import React from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { CheckCircle2, Shield, Users, RefreshCw } from 'lucide-react';

export const HowToPlayModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Play — Official Rules" maxWidth="max-w-xl">
      <div className="space-y-5 text-sm text-slate-300">
        {/* Intro */}
        <p>
          Welcome to <span className="font-bold text-white">Floyd Technology Hub Multiplayer Tic-Tac-Toe</span>. Challenge friends online with server-authoritative real-time synchronization.
        </p>

        {/* Rule Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Users className="w-4 h-4" />
              <span>Two Players</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Room creator plays as <span className="text-cyan-400 font-bold">X</span> and moves first. The joining opponent plays as <span className="text-pink-500 font-bold">O</span>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-violet-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Winning The Game</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Place 3 of your marks in a horizontal row, vertical column, or diagonal line to win the round immediately.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <RefreshCw className="w-4 h-4" />
              <span>Series & Rematches</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              After a round ends, either player can request a rematch. When both players agree, starting marks alternate fairly.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Shield className="w-4 h-4" />
              <span>Anti-Cheat & Reconnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All moves are validated server-side. If a connection drops, a 45-second grace period allows reconnecting seamlessly.
            </p>
          </div>
        </div>

        {/* 8 Winning Combinations Diagram */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            8 Authoritative Winning Combinations
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
            <div className="p-2 rounded-lg bg-black/30 border border-white/5">Rows: 1, 2, 3</div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/5">Cols: 1, 2, 3</div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/5">Diag: Top-L → Btm-R</div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/5">Diag: Top-R → Btm-L</div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" onClick={onClose}>
            Got It, Let's Play!
          </Button>
        </div>
      </div>
    </Modal>
  );
};
