import { nanoid } from 'nanoid';
import { GuestPlayer } from '../models/GuestPlayer.js';
import { generateGuestToken } from '../utils/token.js';

export const createOrRecoverGuestSession = async (req, res, next) => {
  try {
    const { nickname, existingPlayerId } = req.body;
    let player = null;

    if (existingPlayerId) {
      player = await GuestPlayer.findOne({ playerId: existingPlayerId });
      if (player) {
        player.nickname = nickname.trim();
        player.lastActive = new Date();
        await player.save();
      }
    }

    if (!player) {
      const playerId = `guest_${nanoid(12)}`;
      player = new GuestPlayer({
        playerId,
        nickname: nickname.trim(),
        avatarSeed: nanoid(8),
      });
      await player.save();
    }

    const token = generateGuestToken({
      playerId: player.playerId,
      nickname: player.nickname,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        player: {
          playerId: player.playerId,
          nickname: player.nickname,
          avatarSeed: player.avatarSeed,
          stats: player.stats,
          createdAt: player.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentGuest = async (req, res, next) => {
  try {
    const player = await GuestPlayer.findOne({ playerId: req.guest.playerId });
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Guest player not found.',
        code: 'PLAYER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        player: {
          playerId: player.playerId,
          nickname: player.nickname,
          avatarSeed: player.avatarSeed,
          stats: player.stats,
          createdAt: player.createdAt,
          lastActive: player.lastActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateNickname = async (req, res, next) => {
  try {
    const { nickname } = req.body;
    const player = await GuestPlayer.findOne({ playerId: req.guest.playerId });
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Guest player not found.',
        code: 'PLAYER_NOT_FOUND',
      });
    }

    player.nickname = nickname.trim();
    player.lastActive = new Date();
    await player.save();

    // Generate refreshed token with updated nickname
    const token = generateGuestToken({
      playerId: player.playerId,
      nickname: player.nickname,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        player: {
          playerId: player.playerId,
          nickname: player.nickname,
          avatarSeed: player.avatarSeed,
          stats: player.stats,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
