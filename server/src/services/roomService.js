import { GameRoom } from '../models/GameRoom.js';
import { generateRoomCode } from '../utils/roomCode.js';
import { ENV } from '../config/env.js';

/**
 * Creates a new private game room.
 */
export const createRoom = async (creatorId, nickname) => {
  let roomCode = generateRoomCode();
  // Ensure uniqueness
  let attempts = 0;
  while (await GameRoom.findOne({ roomCode })) {
    roomCode = generateRoomCode();
    attempts++;
    if (attempts > 10) {
      throw new Error('Failed to generate unique room code. Please try again.');
    }
  }

  const scores = new Map();
  scores.set(creatorId, 0);

  const room = new GameRoom({
    roomCode,
    creatorId,
    status: 'WAITING',
    board: Array(9).fill(''),
    currentTurn: 'X',
    startingMark: 'X',
    roundNumber: 1,
    stateVersion: 1,
    players: [
      {
        playerId: creatorId,
        nickname: nickname.trim(),
        mark: 'X',
        connected: true,
      },
    ],
    scores,
    expiresAt: new Date(Date.now() + ENV.ROOM_INACTIVITY_TIMEOUT_MS),
  });

  await room.save();
  return room;
};

/**
 * Adds an opponent to a waiting room or allows seat recovery for an existing player.
 */
export const joinRoom = async (roomCode, playerId, nickname) => {
  const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    return { success: false, code: 'ROOM_NOT_FOUND', error: 'Room does not exist.' };
  }

  // Check if player is already seated (Seat recovery)
  const existingPlayer = room.players.find((p) => p.playerId === playerId);
  if (existingPlayer) {
    existingPlayer.connected = true;
    existingPlayer.disconnectedAt = null;
    existingPlayer.nickname = nickname ? nickname.trim() : existingPlayer.nickname;
    room.expiresAt = new Date(Date.now() + ENV.ROOM_INACTIVITY_TIMEOUT_MS);
    await room.save();
    return { success: true, room, isRejoin: true, mark: existingPlayer.mark };
  }

  // If room already has 2 seated players, it is full
  if (room.players.length >= 2) {
    return {
      success: false,
      code: 'ROOM_FULL',
      error: 'Room is full. Two players are already in this room.',
    };
  }

  // Join as player 'O'
  room.opponentId = playerId;
  room.players.push({
    playerId,
    nickname: nickname.trim(),
    mark: 'O',
    connected: true,
  });

  room.status = 'PLAYING';
  room.scores.set(playerId, 0);
  room.expiresAt = new Date(Date.now() + ENV.ROOM_INACTIVITY_TIMEOUT_MS);
  await room.save();

  return { success: true, room, isRejoin: false, mark: 'O' };
};

/**
 * Retrieves a room by code.
 */
export const getRoomByCode = async (roomCode) => {
  if (!roomCode) return null;
  return GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
};

/**
 * Updates a player's connection state in the room.
 */
export const updatePlayerConnection = async (roomCode, playerId, connected, socketId = null) => {
  const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) return null;

  const player = room.players.find((p) => p.playerId === playerId);
  if (player) {
    player.connected = connected;
    player.socketId = connected ? socketId : null;
    player.disconnectedAt = connected ? null : new Date();
    await room.save();
  }
  return room;
};
