import { describe, it, expect } from 'vitest';
import {
  checkWin,
  checkDraw,
  validateMove,
  applyMove,
  resetRoundForRematch,
  WINNING_COMBINATIONS,
} from '../src/services/gameEngine.js';

describe('Authoritative Game Engine', () => {
  describe('checkWin - All 8 Winning Combinations', () => {
    it('detects Row 1 win: [0, 1, 2]', () => {
      const board = ['X', 'X', 'X', '', '', '', '', '', ''];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('X');
      expect(res.winningLine).toEqual([0, 1, 2]);
    });

    it('detects Row 2 win: [3, 4, 5]', () => {
      const board = ['', '', '', 'O', 'O', 'O', '', '', ''];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('O');
      expect(res.winningLine).toEqual([3, 4, 5]);
    });

    it('detects Row 3 win: [6, 7, 8]', () => {
      const board = ['', '', '', '', '', '', 'X', 'X', 'X'];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('X');
      expect(res.winningLine).toEqual([6, 7, 8]);
    });

    it('detects Col 1 win: [0, 3, 6]', () => {
      const board = ['O', '', '', 'O', '', '', 'O', '', ''];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('O');
      expect(res.winningLine).toEqual([0, 3, 6]);
    });

    it('detects Col 2 win: [1, 4, 7]', () => {
      const board = ['', 'X', '', '', 'X', '', '', 'X', ''];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('X');
      expect(res.winningLine).toEqual([1, 4, 7]);
    });

    it('detects Col 3 win: [2, 5, 8]', () => {
      const board = ['', '', 'O', '', '', 'O', '', '', 'O'];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('O');
      expect(res.winningLine).toEqual([2, 5, 8]);
    });

    it('detects Diagonal \\ win: [0, 4, 8]', () => {
      const board = ['X', '', '', '', 'X', '', '', '', 'X'];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('X');
      expect(res.winningLine).toEqual([0, 4, 8]);
    });

    it('detects Diagonal / win: [2, 4, 6]', () => {
      const board = ['', '', 'O', '', 'O', '', 'O', '', ''];
      const res = checkWin(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe('O');
      expect(res.winningLine).toEqual([2, 4, 6]);
    });

    it('returns null when no winner exists', () => {
      const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', ''];
      expect(checkWin(board)).toBeNull();
    });
  });

  describe('checkDraw', () => {
    it('detects a drawn game when board is full and no winner', () => {
      // Classic drawn board
      // X O X
      // X X O
      // O X O
      const board = ['X', 'O', 'X', 'X', 'X', 'O', 'O', 'X', 'O'];
      expect(checkWin(board)).toBeNull();
      expect(checkDraw(board)).toBe(true);
    });

    it('does not detect draw when board still has empty cells', () => {
      const board = ['X', 'O', 'X', '', 'X', 'O', 'O', 'X', 'O'];
      expect(checkDraw(board)).toBe(false);
    });

    it('does not detect draw when board is full but a winning combo exists', () => {
      const board = ['X', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
      expect(checkWin(board)).not.toBeNull();
      expect(checkDraw(board)).toBe(false);
    });
  });

  describe('validateMove', () => {
    const mockRoom = {
      roomCode: 'TEST12',
      status: 'PLAYING',
      currentTurn: 'X',
      stateVersion: 1,
      board: Array(9).fill(''),
      players: [
        { playerId: 'p1', nickname: 'Alice', mark: 'X' },
        { playerId: 'p2', nickname: 'Bob', mark: 'O' },
      ],
    };

    it('allows valid move for current player', () => {
      const res = validateMove(mockRoom, 'p1', 4, 1);
      expect(res.valid).toBe(true);
      expect(res.playerSeat.mark).toBe('X');
    });

    it('rejects move out of turn', () => {
      const res = validateMove(mockRoom, 'p2', 4, 1);
      expect(res.valid).toBe(false);
      expect(res.code).toBe('NOT_YOUR_TURN');
    });

    it('rejects move on occupied cell', () => {
      const roomWithMove = {
        ...mockRoom,
        board: ['X', '', '', '', '', '', '', '', ''],
      };
      const res = validateMove(roomWithMove, 'p1', 0, 1);
      expect(res.valid).toBe(false);
      expect(res.code).toBe('CELL_OCCUPIED');
    });

    it('rejects invalid cell index', () => {
      expect(validateMove(mockRoom, 'p1', -1, 1).code).toBe('INVALID_CELL_INDEX');
      expect(validateMove(mockRoom, 'p1', 9, 1).code).toBe('INVALID_CELL_INDEX');
      expect(validateMove(mockRoom, 'p1', 3.5, 1).code).toBe('INVALID_CELL_INDEX');
    });

    it('rejects move when stateVersion is stale', () => {
      const res = validateMove(mockRoom, 'p1', 2, 0); // expects 1, got 0
      expect(res.valid).toBe(false);
      expect(res.code).toBe('STALE_STATE_VERSION');
    });

    it('rejects move if room is FINISHED or WAITING', () => {
      const waitingRoom = { ...mockRoom, status: 'WAITING' };
      expect(validateMove(waitingRoom, 'p1', 0, 1).code).toBe('INVALID_ROOM_STATUS');

      const finishedRoom = { ...mockRoom, status: 'FINISHED' };
      expect(validateMove(finishedRoom, 'p1', 0, 1).code).toBe('INVALID_ROOM_STATUS');
    });
  });

  describe('applyMove & resetRoundForRematch', () => {
    it('applies move, switches turn, and increments stateVersion', () => {
      const room = {
        roomCode: 'TEST12',
        status: 'PLAYING',
        currentTurn: 'X',
        stateVersion: 1,
        board: Array(9).fill(''),
        players: [
          { playerId: 'p1', mark: 'X' },
          { playerId: 'p2', mark: 'O' },
        ],
      };

      const outcome = applyMove(room, 'p1', 4);
      expect(outcome.finished).toBe(false);
      expect(room.board[4]).toBe('X');
      expect(room.currentTurn).toBe('O');
      expect(room.stateVersion).toBe(2);
      expect(room.lastMove.cellIndex).toBe(4);
    });

    it('detects round win and updates status to FINISHED', () => {
      const room = {
        roomCode: 'TEST12',
        status: 'PLAYING',
        currentTurn: 'X',
        stateVersion: 5,
        board: ['X', 'X', '', 'O', 'O', '', '', '', ''],
        players: [
          { playerId: 'p1', mark: 'X' },
          { playerId: 'p2', mark: 'O' },
        ],
      };

      const outcome = applyMove(room, 'p1', 2);
      expect(outcome.finished).toBe(true);
      expect(outcome.isWin).toBe(true);
      expect(room.status).toBe('FINISHED');
      expect(room.roundResult.winnerId).toBe('p1');
      expect(room.roundResult.winnerMark).toBe('X');
      expect(room.roundResult.winningLine).toEqual([0, 1, 2]);
    });

    it('resets round for rematch cleanly with alternating starting mark', () => {
      const finishedRoom = {
        roomCode: 'TEST12',
        status: 'FINISHED',
        startingMark: 'X',
        currentTurn: 'X',
        roundNumber: 1,
        stateVersion: 10,
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        rematchRequests: ['p1', 'p2'],
        roundResult: { winnerId: 'p1' },
      };

      resetRoundForRematch(finishedRoom);
      expect(finishedRoom.status).toBe('PLAYING');
      expect(finishedRoom.board.every((c) => c === '')).toBe(true);
      expect(finishedRoom.roundNumber).toBe(2);
      expect(finishedRoom.startingMark).toBe('O');
      expect(finishedRoom.currentTurn).toBe('O');
      expect(finishedRoom.rematchRequests).toEqual([]);
      expect(finishedRoom.roundResult.winnerId).toBeNull();
    });
  });
});
