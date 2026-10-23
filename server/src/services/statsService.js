import { nanoid } from 'nanoid';
import { GameRound } from '../models/GameRound.js';
import { GuestPlayer } from '../models/GuestPlayer.js';
import { logger } from '../config/logger.js';

/**
 * Idempotently records a finished round and updates player statistics.
 */
export const recordCompletedRound = async ({
  room,
  moves,
  startedAt,
}) => {
  const roundId = `round_${nanoid(12)}`;
  const endedAt = room.roundResult.finishedAt || new Date();
  const durationMs = Math.max(0, endedAt.getTime() - new Date(startedAt).getTime());

  try {
    const roundDoc = new GameRound({
      roundId,
      roomCode: room.roomCode,
      roundNumber: room.roundNumber,
      players: room.players.map((p) => ({
        playerId: p.playerId,
        nickname: p.nickname,
        mark: p.mark,
      })),
      moves: moves || [],
      finalBoard: [...room.board],
      winnerId: room.roundResult.winnerId,
      winnerMark: room.roundResult.winnerMark,
      isDraw: room.roundResult.isDraw,
      winningLine: room.roundResult.winningLine || [],
      durationMs,
      startedAt,
      endedAt,
      statsProcessed: true,
    });

    await roundDoc.save();

    // Update player statistics
    if (room.roundResult.isDraw) {
      for (const p of room.players) {
        const player = await GuestPlayer.findOne({ playerId: p.playerId });
        if (player) {
          player.updateStats('DRAW');
          await player.save();
        }
      }
    } else if (room.roundResult.winnerId) {
      const winnerId = room.roundResult.winnerId;
      const loser = room.players.find((p) => p.playerId !== winnerId);

      const winnerPlayer = await GuestPlayer.findOne({ playerId: winnerId });
      if (winnerPlayer) {
        winnerPlayer.updateStats('WIN');
        await winnerPlayer.save();
      }

      if (loser) {
        const loserPlayer = await GuestPlayer.findOne({ playerId: loser.playerId });
        if (loserPlayer) {
          loserPlayer.updateStats('LOSS');
          await loserPlayer.save();
        }
      }

      // Update room cumulative score
      if (room.scores instanceof Map) {
        const currentWins = room.scores.get(winnerId) || 0;
        room.scores.set(winnerId, currentWins + 1);
      } else {
        const currentWins = (room.scores && room.scores[winnerId]) || 0;
        if (!room.scores) room.scores = {};
        room.scores[winnerId] = currentWins + 1;
      }
      await room.save();
    }

    return roundDoc;
  } catch (error) {
    logger.error('Error recording completed round statistics:', error);
    throw error;
  }
};
