export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal from top-left
  [2, 4, 6], // Diagonal from top-right
];

/**
 * Checks if the current board has a winner.
 * @param {Array<string>} board - 9-element array
 * @returns {{ winner: string, winningLine: number[] } | null}
 */
export const checkWin = (board) => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningLine: combo,
      };
    }
  }
  return null;
};

/**
 * Checks if the board is full with no winner.
 * @param {Array<string>} board - 9-element array
 * @returns {boolean}
 */
export const checkDraw = (board) => {
  const isFull = board.every((cell) => cell !== '' && cell !== null);
  if (!isFull) return false;
  return checkWin(board) === null;
};

/**
 * Validates whether a move can be executed.
 */
export const validateMove = (room, playerId, cellIndex, clientStateVersion) => {
  if (!room) {
    return { valid: false, code: 'ROOM_NOT_FOUND', error: 'Room does not exist.' };
  }

  if (room.status !== 'PLAYING') {
    return {
      valid: false,
      code: 'INVALID_ROOM_STATUS',
      error: room.status === 'WAITING' ? 'Waiting for opponent to join.' : 'Round has already finished.',
    };
  }

  const playerSeat = room.players.find((p) => p.playerId === playerId);
  if (!playerSeat) {
    return { valid: false, code: 'NOT_A_PLAYER', error: 'You are not a seated player in this room.' };
  }

  if (playerSeat.mark !== room.currentTurn) {
    return { valid: false, code: 'NOT_YOUR_TURN', error: 'It is not your turn.' };
  }

  if (typeof cellIndex !== 'number' || cellIndex < 0 || cellIndex > 8 || !Number.isInteger(cellIndex)) {
    return { valid: false, code: 'INVALID_CELL_INDEX', error: 'Cell index must be an integer between 0 and 8.' };
  }

  if (room.board[cellIndex] !== '' && room.board[cellIndex] !== null) {
    return { valid: false, code: 'CELL_OCCUPIED', error: 'Cell is already occupied.' };
  }

  // Version check (prevents stale moves from applying out of order)
  if (clientStateVersion !== undefined && clientStateVersion !== null && clientStateVersion !== room.stateVersion) {
    return {
      valid: false,
      code: 'STALE_STATE_VERSION',
      error: 'Client state version is out of sync. Please resync.',
      expectedVersion: room.stateVersion,
    };
  }

  return { valid: true, playerSeat };
};

/**
 * Applies a validated move to the room state.
 */
export const applyMove = (room, playerId, cellIndex) => {
  const playerSeat = room.players.find((p) => p.playerId === playerId);
  const mark = playerSeat.mark;

  // Make move
  room.board[cellIndex] = mark;
  room.lastMove = {
    playerId,
    mark,
    cellIndex,
    timestamp: new Date(),
  };
  room.stateVersion += 1;

  // Check outcome
  const winResult = checkWin(room.board);
  if (winResult) {
    room.status = 'FINISHED';
    room.roundResult = {
      winnerMark: winResult.winner,
      winnerId: playerId,
      isDraw: false,
      winningLine: winResult.winningLine,
      finishedAt: new Date(),
    };
    return {
      finished: true,
      result: room.roundResult,
      isWin: true,
      winnerMark: winResult.winner,
      winningLine: winResult.winningLine,
    };
  }

  const isDraw = checkDraw(room.board);
  if (isDraw) {
    room.status = 'FINISHED';
    room.roundResult = {
      winnerMark: null,
      winnerId: null,
      isDraw: true,
      winningLine: [],
      finishedAt: new Date(),
    };
    return {
      finished: true,
      result: room.roundResult,
      isDraw: true,
    };
  }

  // Next player's turn
  room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
  return {
    finished: false,
    nextTurn: room.currentTurn,
  };
};

/**
 * Resets the room for a fresh rematch round.
 */
export const resetRoundForRematch = (room) => {
  room.board = Array(9).fill('');
  room.status = 'PLAYING';
  room.roundNumber += 1;
  room.stateVersion += 1;
  room.roundResult = {
    winnerMark: null,
    winnerId: null,
    isDraw: false,
    winningLine: [],
    finishedAt: null,
  };
  room.rematchRequests = [];
  room.lastMove = null;

  // Alternate starting turn for fair play across rounds
  room.startingMark = room.startingMark === 'X' ? 'O' : 'X';
  room.currentTurn = room.startingMark;

  return room;
};
