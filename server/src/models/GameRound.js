import mongoose from 'mongoose';

const MoveSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },
    playerId: { type: String, required: true },
    mark: { type: String, enum: ['X', 'O'], required: true },
    cellIndex: { type: Number, min: 0, max: 8, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GameRoundSchema = new mongoose.Schema(
  {
    roundId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    players: [
      {
        playerId: { type: String, required: true },
        nickname: { type: String, required: true },
        mark: { type: String, enum: ['X', 'O'], required: true },
      },
    ],
    moves: [MoveSchema],
    finalBoard: {
      type: [String],
      required: true,
    },
    winnerId: {
      type: String,
      default: null,
    },
    winnerMark: {
      type: String,
      default: null,
    },
    isDraw: {
      type: Boolean,
      default: false,
    },
    winningLine: {
      type: [Number],
      default: [],
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    statsProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for player history queries
GameRoundSchema.index({ 'players.playerId': 1, createdAt: -1 });

export const GameRound = mongoose.model('GameRound', GameRoundSchema);
