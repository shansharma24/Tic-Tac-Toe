import React from 'react';
import { GameCell } from './GameCell.jsx';
import { WinningLine } from './WinningLine.jsx';

export const GameBoard = ({
  board,
  winningLine = [],
  lastMove,
  isMyTurn,
  disabled,
  onCellClick,
}) => {
  return (
    <div className="relative p-3 sm:p-4 rounded-3xl bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-xl inline-block">
      {/* 3x3 Grid */}
      <div
        role="grid"
        aria-label="Tic-Tac-Toe Game Board"
        className="relative grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3.5"
      >
        {board.map((cellValue, index) => {
          const isWinningCell = winningLine.includes(index);
          const isLast = lastMove?.cellIndex === index;

          return (
            <GameCell
              key={index}
              index={index}
              value={cellValue}
              isWinningCell={isWinningCell}
              isLastMove={isLast}
              isMyTurn={isMyTurn}
              disabled={disabled}
              onClick={onCellClick}
            />
          );
        })}

        {/* Dynamic Strike-through Winning Line */}
        <WinningLine winningLine={winningLine} />
      </div>
    </div>
  );
};
