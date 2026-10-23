import React, { useState } from 'react';
import { Button } from '../../components/common/Button.jsx';
import { Copy, Check, LogOut, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../context/SoundContext.jsx';

export const GameControls = ({
  roomCode,
  isFinished,
  rematchRequested,
  onRematchRequest,
  onLeaveRoom,
}) => {
  const { muted, toggleMute } = useSound();
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-4">
      {/* Copy Room Code Button */}
      <button
        onClick={handleCopy}
        type="button"
        title="Copy invitation room code"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">Code Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Room: {roomCode}</span>
          </>
        )}
      </button>

      {/* Rematch Button (when finished) */}
      {isFinished && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRematchRequest}
          disabled={rematchRequested}
          className="shadow-[0_0_15px_rgba(139,92,246,0.35)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{rematchRequested ? 'Rematch Requested...' : 'Request Rematch'}</span>
        </Button>
      )}

      {/* Sound Toggle */}
      <button
        onClick={toggleMute}
        title={muted ? 'Unmute Audio' : 'Mute Audio'}
        type="button"
        className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
      </button>

      {/* Leave Room Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (isFinished ? onLeaveRoom() : setShowLeaveConfirm(true))}
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Leave Match</span>
      </Button>

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-white">Forfeit Active Match?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you leave while a round is in progress, the match may be forfeited to your opponent.
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowLeaveConfirm(false)}>
                Stay & Play
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveRoom();
                }}
              >
                Yes, Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
