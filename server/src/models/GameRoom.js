import mongoose from 'mongoose';

const PlayerSeatSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    nickname: { type: String, required: true },
    mark: { type: String, enum: ['X', 'O'], required: true },
    connected: { type: Boolean, default: true },
    socketId: { type: String, default: null },
    disconnectedAt: { type: Date, default: null },
  },
  { _id: false }
);

const GameRoomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['WAITING', 'PLAYING', 'FINISHED'],
      default: 'WAITING',
      index: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    opponentId: {
      type: String,
      default: null,
    },
    players: [PlayerSeatSchema],
    board: {
      type: [String],
      default: () => Array(9).fill(''),
      validate: [
        (val) => val.length === 9,
        'Board must contain exactly 9 positions',
      ],
    },
    currentTurn: {
      type: String,
      enum: ['X', 'O'],
      default: 'X',
    },
    startingMark: {
      type: String,
      enum: ['X', 'O'],
      default: 'X',
    },
    roundNumber: {
      type: Number,
      default: 1,
    },
    stateVersion: {
      type: Number,
      default: 1,
    },
    lastMove: {
      playerId: String,
      mark: String,
      cellIndex: Number,
      timestamp: Date,
    },
    roundResult: {
      winnerMark: { type: String, default: null },
      winnerId: { type: String, default: null },
      isDraw: { type: Boolean, default: false },
      winningLine: { type: [Number], default: [] },
      finishedAt: { type: Date, default: null },
    },
    rematchRequests: {
      type: [String],
      default: [],
    },
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24hr TTL
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const GameRoom = mongoose.model('GameRoom', GameRoomSchema);
