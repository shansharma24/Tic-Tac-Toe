import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logo } from '../components/common/Logo.jsx';
import { GameBoard } from '../features/game/GameBoard.jsx';
import { PlayerCard } from '../features/game/PlayerCard.jsx';
import { SoundProvider } from '../context/SoundContext.jsx';

describe('Frontend UI Components', () => {
  it('renders Floyd Technology Hub branding logo prominently', () => {
    render(<Logo />);
    expect(screen.getByText('Floyd')).toBeInTheDocument();
    expect(screen.getByText('Technology Hub')).toBeInTheDocument();
    expect(screen.getByText('Multiplayer Arena')).toBeInTheDocument();
  });

  it('renders GameBoard with 9 accessible cells', () => {
    const mockBoard = ['', '', '', '', '', '', '', '', ''];
    const handleClick = vi.fn();

    render(
      <SoundProvider>
        <GameBoard
          board={mockBoard}
          winningLine={[]}
          lastMove={null}
          isMyTurn={true}
          disabled={false}
          onCellClick={handleClick}
        />
      </SoundProvider>
    );

    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(9);

    // Clicking a cell triggers handler
    fireEvent.click(cells[0]);
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('renders PlayerCard with mark, nickname, and online status', () => {
    const mockPlayer = {
      playerId: 'p123',
      nickname: 'CyberKnight',
      connected: true,
    };

    render(
      <PlayerCard
        player={mockPlayer}
        mark="X"
        isCurrentTurn={true}
        isLocalPlayer={true}
        score={3}
      />
    );

    expect(screen.getByText('CyberKnight')).toBeInTheDocument();
    expect(screen.getByText('YOU')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
