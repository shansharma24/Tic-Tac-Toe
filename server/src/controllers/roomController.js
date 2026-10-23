import { createRoom, joinRoom, getRoomByCode } from '../services/roomService.js';

export const handleCreateRoom = async (req, res, next) => {
  try {
    const { playerId, nickname } = req.guest;
    const room = await createRoom(playerId, nickname);

    res.status(201).json({
      success: true,
      data: {
        roomCode: room.roomCode,
        room,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleJoinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    const { playerId, nickname } = req.guest;

    const result = await joinRoom(roomCode, playerId, nickname);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: result.code,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        room: result.room,
        mark: result.mark,
        isRejoin: result.isRejoin,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const room = await getRoomByCode(roomCode);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found.',
        code: 'ROOM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        room,
      },
    });
  } catch (error) {
    next(error);
  }
};
