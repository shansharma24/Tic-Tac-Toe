import mongoose from 'mongoose';

const GuestPlayerSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    avatarSeed: {
      type: String,
      default: () => Math.random().toString(36).substring(2, 10),
    },
    stats: {
      gamesPlayed: { type: Number, default: 0, index: true },
      wins: { type: Number, default: 0, index: true },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      winRate: { type: Number, default: 0, index: true }, // percentage: 0 to 100
      winStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save or recalculation helper
GuestPlayerSchema.methods.updateStats = function (result) {
  // result: 'WIN' | 'LOSS' | 'DRAW'
  this.stats.gamesPlayed += 1;
  if (result === 'WIN') {
    this.stats.wins += 1;
    this.stats.winStreak += 1;
    if (this.stats.winStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.winStreak;
    }
  } else if (result === 'LOSS') {
    this.stats.losses += 1;
    this.stats.winStreak = 0;
  } else if (result === 'DRAW') {
    this.stats.draws += 1;
    // Streak is paused or reset on draw (reset)
    this.stats.winStreak = 0;
  }

  this.stats.winRate =
    this.stats.gamesPlayed > 0
      ? Math.round((this.stats.wins / this.stats.gamesPlayed) * 100)
      : 0;
  this.lastActive = new Date();
};

export const GuestPlayer = mongoose.model('GuestPlayer', GuestPlayerSchema);
