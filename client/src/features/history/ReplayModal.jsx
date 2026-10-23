import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { GameBoard } from '../game/GameBoard.jsx';
import { api } from '../../services/api.js';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Loader2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext.jsx';

export const ReplayModal = ({ roundId, isOpen, onClose }) => {
  const { playMove, playClick } = useSound();
  const [roundData, setRoundData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !roundId) return;

    setLoading(true);
    setError('');
    setCurrentStep(0);
    setIsPlaying(false);

    api
      .getRoundReplay(roundId)
      .then((data) => {
        setRoundData(data);
        setCurrentStep(data.moves?.length || 0); // start at end or start at 0
      })
      .catch((err) => setError(err.message || 'Failed to load replay data.'))
      .finally(() => setLoading(false));
  }, [isOpen, roundId]);

  // Compute board state at current step
  const moves = roundData?.moves || [];
  const currentBoard = Array(9).fill('');
  for (let i = 0; i < currentStep && i < moves.length; i++) {
    const m = moves[i];
    currentBoard[m.cellIndex] = m.mark;
  }

  const lastMoveAtStep = currentStep > 0 && currentStep <= moves.length ? moves[currentStep - 1] : null;

  // Auto-play interval
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= moves.length) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          if (moves[next - 1]) {
            playMove(moves[next - 1].mark);
          }
          return next;
        });
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isPlaying, moves, playMove]);

  const handleStepChange = (newStep) => {
    setIsPlaying(false);
    playClick();
    setCurrentStep(Math.max(0, Math.min(moves.length, newStep)));
  };

  const isFinalStep = currentStep === moves.length;
  const activeWinningLine = isFinalStep ? roundData?.winningLine || [] : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsPlaying(false);
        onClose();
      }}
      title={`Match Replay • ${roundData?.roomCode || ''}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs text-slate-400">Loading match replay...</span>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-400 text-sm">{error}</div>
      ) : !roundData ? null : (
        <div className="space-y-6 flex flex-col items-center">
          {/* Replay Info Header */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono px-2">
            <span>
              Players: {roundData.players[0]?.nickname} (X) vs {roundData.players[1]?.nickname} (O)
            </span>
            <span className="font-bold text-cyan-300">
              Move {currentStep} of {moves.length}
            </span>
          </div>

          {/* Interactive Board Viewer */}
          <GameBoard
            board={currentBoard}
            winningLine={activeWinningLine}
            lastMove={lastMoveAtStep}
            isMyTurn={false}
            disabled={true}
            onCellClick={() => {}}
          />

          {/* Current Step Description */}
          <div className="text-center text-xs font-mono text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-full">
            {currentStep === 0 ? (
              <span>Initial empty board before first move.</span>
            ) : isFinalStep ? (
              <span className="text-emerald-400 font-bold">
                {roundData.isDraw
                  ? 'Final Outcome: Game Drawn.'
                  : `Final Outcome: ${roundData.winnerMark} Won!`}
              </span>
            ) : (
              <span>
                Move #{currentStep}: {lastMoveAtStep?.mark} placed in cell {lastMoveAtStep?.cellIndex + 1}
              </span>
            )}
          </div>

          {/* Replay Player Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              disabled={currentStep === 0}
              onClick={() => handleStepChange(0)}
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="glass"
              size="sm"
              disabled={currentStep === 0}
              onClick={() => handleStepChange(currentStep - 1)}
              title="Previous Move"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant={isPlaying ? 'danger' : 'primary'}
              size="md"
              onClick={() => {
                if (currentStep >= moves.length) {
                  setCurrentStep(0);
                }
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : currentStep >= moves.length ? 'Replay' : 'Play'}</span>
            </Button>

            <Button
              variant="glass"
              size="sm"
              disabled={currentStep >= moves.length}
              onClick={() => handleStepChange(currentStep + 1)}
              title="Next Move"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
