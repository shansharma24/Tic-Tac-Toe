import { GameRound } from '../models/GameRound.js';

export const getMatchHistory = async (req, res, next) => {
  try {
    const playerId = req.guest.playerId;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const query = { 'players.playerId': playerId };

    const [rounds, total] = await Promise.all([
      GameRound.find(query)
        .sort({ endedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-moves') // exclude heavy moves array from list view
        .lean(),
      GameRound.countDocuments(query),
    ]);

    const formattedHistory = rounds.map((r) => {
      const currentPlayer = r.players.find((p) => p.playerId === playerId);
      const opponent = r.players.find((p) => p.playerId !== playerId);

      let outcome = 'DRAW';
      if (!r.isDraw) {
        outcome = r.winnerId === playerId ? 'WIN' : 'LOSS';
      }

      return {
        roundId: r.roundId,
        roomCode: r.roomCode,
        roundNumber: r.roundNumber,
        outcome,
        myMark: currentPlayer ? currentPlayer.mark : null,
        opponent: opponent
          ? {
              playerId: opponent.playerId,
              nickname: opponent.nickname,
              mark: opponent.mark,
            }
          : { nickname: 'Opponent' },
        finalBoard: r.finalBoard,
        winningLine: r.winningLine,
        totalMoves: r.finalBoard.filter((c) => c !== '' && c !== null).length,
        durationMs: r.durationMs,
        startedAt: r.startedAt,
        endedAt: r.endedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoundReplay = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const round = await GameRound.findOne({ roundId }).lean();
    if (!round) {
      return res.status(404).json({
        success: false,
        error: 'Round not found or has expired.',
        code: 'ROUND_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        roundId: round.roundId,
        roomCode: round.roomCode,
        roundNumber: round.roundNumber,
        players: round.players,
        moves: round.moves,
        finalBoard: round.finalBoard,
        winnerId: round.winnerId,
        winnerMark: round.winnerMark,
        isDraw: round.isDraw,
        winningLine: round.winningLine,
        startedAt: round.startedAt,
        endedAt: round.endedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
