import { GuestPlayer } from '../models/GuestPlayer.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const query = { 'stats.gamesPlayed': { $gt: 0 } };

    const [players, total] = await Promise.all([
      GuestPlayer.find(query)
        .sort({ 'stats.wins': -1, 'stats.winRate': -1, 'stats.gamesPlayed': -1 })
        .skip(skip)
        .limit(limit)
        .select('playerId nickname avatarSeed stats updatedAt')
        .lean(),
      GuestPlayer.countDocuments(query),
    ]);

    const rankedPlayers = players.map((p, index) => ({
      rank: skip + index + 1,
      playerId: p.playerId,
      nickname: p.nickname,
      avatarSeed: p.avatarSeed,
      stats: p.stats,
      lastPlayed: p.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedPlayers,
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

export const getPlayerStats = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const player = await GuestPlayer.findOne({ playerId }).lean();
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found.',
        code: 'PLAYER_NOT_FOUND',
      });
    }

    // Calculate global rank
    const rank = await GuestPlayer.countDocuments({
      'stats.gamesPlayed': { $gt: 0 },
      $or: [
        { 'stats.wins': { $gt: player.stats.wins } },
        {
          'stats.wins': player.stats.wins,
          'stats.winRate': { $gt: player.stats.winRate },
        },
      ],
    }) + 1;

    res.status(200).json({
      success: true,
      data: {
        player: {
          playerId: player.playerId,
          nickname: player.nickname,
          avatarSeed: player.avatarSeed,
          stats: player.stats,
          rank: player.stats.gamesPlayed > 0 ? rank : null,
          createdAt: player.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
