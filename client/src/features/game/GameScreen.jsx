import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameBoard } from './GameBoard.jsx';
import { PlayerCard } from './PlayerCard.jsx';
import { GameControls } from './GameControls.jsx';
import { ChatBox } from '../chat/ChatBox.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSound } from '../../context/SoundContext.jsx';
import { Trophy, Frown, Equal, MessageSquare, RotateCcw } from 'lucide-react';

export const GameScreen = ({
  room,
  localMark,
  chatMessages = [],
  reconnectingCountdown = null,
  rematchRequested = false,
  rematchStatus = null,
  onCellClick,
  onSendMessage,
  onRematchRequest,
  onLeaveRoom,
}) => {
  const { player } = useAuth();
  const { playVictory, playDefeat, playDraw } = useSound();
  const [mobileChatOpen, setMobileChatOpen] = React.useState(false);

  const isPlaying = room.status === 'PLAYING';
  const isFinished = room.status === 'FINISHED';
  const isMyTurn = isPlaying && room.currentTurn === localMark;

  const playerX = room.players.find((p) => p.mark === 'X');
  const playerO = room.players.find((p) => p.mark === 'O');

  const scoreX = room.scores ? room.scores[playerX?.playerId] || 0 : 0;
  const scoreO = room.scores ? room.scores[playerO?.playerId] || 0 : 0;

  // Outcome detection
  const isWinner = isFinished && room.roundResult?.winnerMark === localMark;
  const isLoser = isFinished && !room.roundResult?.isDraw && room.roundResult?.winnerMark !== localMark;
  const isDraw = isFinished && room.roundResult?.isDraw;

  // Sound & Confetti trigger on game finish
  useEffect(() => {
    if (isFinished) {
      if (isWinner) {
        playVictory();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#8b5cf6', '#ec4899', '#10b981'],
          });
        } catch {
          // Ignore confetti error
        }
      } else if (isLoser) {
        playDefeat();
      } else if (isDraw) {
        playDraw();
      }
    }
  }, [isFinished, isWinner, isLoser, isDraw]);

  // Opponent rematch request prompt
  const opponentRematchPending =
    isFinished &&
    rematchStatus?.rematchRequests?.length === 1 &&
    !rematchStatus.rematchRequests.includes(player?.playerId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mobile Chat Toggle Floating Button */}
      <div className="lg:hidden flex justify-end mb-4">
        <button
          onClick={() => setMobileChatOpen(!mobileChatOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-bold text-cyan-300 shadow-glass"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{mobileChatOpen ? 'Hide Match Chat' : 'Open Match Chat'}</span>
          {chatMessages.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player Cards & Match Meta */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
              Round #{room.roundNumber || 1}
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              Code: {room.roomCode}
            </span>
          </div>

          {/* Player X Card */}
          <PlayerCard
            player={playerX}
            mark="X"
            isCurrentTurn={isPlaying && room.currentTurn === 'X'}
            isLocalPlayer={localMark === 'X'}
            score={scoreX}
            reconnectingCountdown={playerX?.connected === false ? reconnectingCountdown : null}
          />

          <div className="flex items-center justify-center text-xs font-mono font-bold text-slate-500 uppercase tracking-widest my-1">
            <span>— VS —</span>
          </div>

          {/* Player O Card */}
          <PlayerCard
            player={playerO}
            mark="O"
            isCurrentTurn={isPlaying && room.currentTurn === 'O'}
            isLocalPlayer={localMark === 'O'}
            score={scoreO}
            reconnectingCountdown={playerO?.connected === false ? reconnectingCountdown : null}
          />
        </div>

        {/* Center Column: Match Status & 3x3 Game Board */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* Status Banner */}
          <div className="w-full max-w-md text-center mb-5">
            {isFinished ? (
              <div
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm tracking-wide shadow-lg ${
                  isWinner
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : isLoser
                    ? 'bg-rose-500/15 border-rose-400/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                    : 'bg-amber-500/15 border-amber-400/50 text-amber-300'
                }`}
              >
                {isWinner && (
                  <>
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <span>Victory! You won this round!</span>
                  </>
                )}
                {isLoser && (
                  <>
                    <Frown className="w-5 h-5 text-rose-400" />
                    <span>Round Finished: Opponent won.</span>
                  </>
                )}
                {isDraw && (
                  <>
                    <Equal className="w-5 h-5 text-amber-400" />
                    <span>Round Drawn: No winner.</span>
                  </>
                )}
              </div>
            ) : isPlaying ? (
              <div
                className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  isMyTurn
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/60 border-white/10 text-slate-300'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isMyTurn ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span>
                  {isMyTurn ? 'Your Turn — Make your move' : `Waiting for Player ${room.currentTurn}...`}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium">
                Waiting for second player to connect...
              </div>
            )}
          </div>

          {/* Opponent requested rematch banner */}
          {opponentRematchPending && (
            <div className="w-full max-w-md mb-4 p-3.5 rounded-2xl bg-violet-600/20 border border-violet-400/40 flex items-center justify-between gap-3 animate-in fade-in">
              <span className="text-xs text-violet-200 font-semibold">
                Opponent wants a rematch!
              </span>
              <Button variant="secondary" size="sm" onClick={onRematchRequest}>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Accept Rematch</span>
              </Button>
            </div>
          )}

          {/* Interactive Game Board */}
          <GameBoard
            board={room.board}
            winningLine={room.roundResult?.winningLine || []}
            lastMove={room.lastMove}
            isMyTurn={isMyTurn}
            disabled={!isPlaying}
            onCellClick={onCellClick}
          />

          {/* Bottom Game Controls */}
          <GameControls
            roomCode={room.roomCode}
            isFinished={isFinished}
            rematchRequested={rematchRequested}
            onRematchRequest={onRematchRequest}
            onLeaveRoom={onLeaveRoom}
          />
        </div>

        {/* Right Column: In-game Live Chat */}
        <div className={`lg:col-span-3 ${mobileChatOpen ? 'block' : 'hidden lg:block'}`}>
          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
            disabled={!room}
          />
        </div>
      </div>
    </div>
  );
};
