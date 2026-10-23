import { Server } from 'socket.io';
import { ENV } from '../config/env.js';
import { logger } from '../config/logger.js';
import { socketAuthMiddleware } from './socketAuth.js';
import {
  createRoom,
  joinRoom,
  getRoomByCode,
  updatePlayerConnection,
} from '../services/roomService.js';
import {
  validateMove,
  applyMove,
  resetRoundForRematch,
} from '../services/gameEngine.js';
import { recordCompletedRound } from '../services/statsService.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { GameRoom } from '../models/GameRoom.js';
import { nanoid } from 'nanoid';

// In-memory runtime state for active matches
const roomRoundMoves = new Map();
const roomRoundStartTimes = new Map();
const disconnectTimers = new Map();
const socketMessageTimes = new Map();

export const setupSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || ENV.CLIENT_ORIGINS.indexOf(origin) !== -1 || ENV.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Socket CORS origin rejected'));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const { playerId, nickname } = socket.guest;
    logger.info(`Player connected: ${nickname} (${playerId}) [socket: ${socket.id}]`);

    // Helper to send errors via callback or event
    const sendError = (ack, eventName, message, code = 'SERVER_ERROR') => {
      if (typeof ack === 'function') {
        ack({ success: false, error: message, code });
      }
      socket.emit('server:error', { message, code, event: eventName });
    };

    /**
     * EVENT: room:create
     */
    socket.on('room:create', async (_, callback) => {
      try {
        const room = await createRoom(playerId, nickname);
        socket.join(room.roomCode);

        // Track socket ID in room
        await updatePlayerConnection(room.roomCode, playerId, true, socket.id);

        roomRoundMoves.set(room.roomCode, []);
        roomRoundStartTimes.set(room.roomCode, new Date());

        const payload = {
          success: true,
          data: {
            roomCode: room.roomCode,
            room,
            mark: 'X',
          },
        };

        if (typeof callback === 'function') callback(payload);
        socket.emit('room:created', payload.data);
        logger.info(`Room created: ${room.roomCode} by ${nickname}`);
      } catch (err) {
        logger.error('Error creating room:', err);
        sendError(callback, 'room:create', 'Failed to create room. Please try again.');
      }
    });

    /**
     * EVENT: room:join
     */
    socket.on('room:join', async (data, callback) => {
      try {
        const roomCode = data?.roomCode?.trim()?.toUpperCase();
        if (!roomCode) {
          return sendError(callback, 'room:join', 'Room code is required', 'INVALID_ROOM_CODE');
        }

        const joinResult = await joinRoom(roomCode, playerId, nickname);
        if (!joinResult.success) {
          return sendError(callback, 'room:join', joinResult.error, joinResult.code);
        }

        const room = joinResult.room;
        socket.join(roomCode);
        await updatePlayerConnection(roomCode, playerId, true, socket.id);

        // Cancel any pending disconnect forfeiture timer
        const timerKey = `${roomCode}_${playerId}`;
        if (disconnectTimers.has(timerKey)) {
          clearTimeout(disconnectTimers.get(timerKey));
          disconnectTimers.delete(timerKey);
        }

        if (!roomRoundStartTimes.has(roomCode)) {
          roomRoundStartTimes.set(roomCode, new Date());
          roomRoundMoves.set(roomCode, []);
        }

        const responseData = {
          roomCode,
          room,
          mark: joinResult.mark,
          isRejoin: joinResult.isRejoin,
        };

        if (typeof callback === 'function') callback({ success: true, data: responseData });
        socket.emit('room:joined', responseData);

        // Broadcast to other player that opponent has joined/rejoined
        socket.to(roomCode).emit('room:player-joined', {
          room,
          player: room.players.find((p) => p.playerId === playerId),
          isRejoin: joinResult.isRejoin,
        });

        // If both players are now present and status is PLAYING, emit game:started
        if (room.status === 'PLAYING' && !joinResult.isRejoin) {
          io.to(roomCode).emit('game:started', {
            room,
            currentTurn: room.currentTurn,
            roundNumber: room.roundNumber,
          });
        }
      } catch (err) {
        logger.error('Error joining room:', err);
        sendError(callback, 'room:join', 'Failed to join room.');
      }
    });

    /**
     * EVENT: game:sync-request
     * Re-synchronizes client with authoritative room state
     */
    socket.on('game:sync-request', async (data, callback) => {
      try {
        const roomCode = data?.roomCode?.toUpperCase();
        if (!roomCode) return;

        const room = await getRoomByCode(roomCode);
        if (!room) {
          return sendError(callback, 'game:sync-request', 'Room not found', 'ROOM_NOT_FOUND');
        }

        const playerSeat = room.players.find((p) => p.playerId === playerId);
        const payload = {
          room,
          mark: playerSeat ? playerSeat.mark : null,
          stateVersion: room.stateVersion,
        };

        if (typeof callback === 'function') callback({ success: true, data: payload });
        socket.emit('room:state', payload);
      } catch (err) {
        logger.error('Error in game:sync-request:', err);
      }
    });

    /**
     * EVENT: game:move
     * Server-authoritative move handling with concurrency & validation
     */
    socket.on('game:move', async (data, callback) => {
      try {
        const { roomCode, cellIndex, stateVersion } = data || {};
        if (!roomCode || cellIndex === undefined) {
          return sendError(callback, 'game:move', 'Invalid move payload', 'INVALID_PAYLOAD');
        }

        const room = await getRoomByCode(roomCode);
        const validation = validateMove(room, playerId, cellIndex, stateVersion);

        if (!validation.valid) {
          const rejectPayload = {
            cellIndex,
            code: validation.code,
            error: validation.error,
            expectedVersion: validation.expectedVersion,
          };
          if (typeof callback === 'function') {
            callback({ success: false, ...rejectPayload });
          }
          return socket.emit('game:move-rejected', rejectPayload);
        }

        // Apply authoritative move
        const moveOutcome = applyMove(room, playerId, cellIndex);

        // Record move into active round moves
        if (!roomRoundMoves.has(room.roomCode)) {
          roomRoundMoves.set(room.roomCode, []);
        }
        const currentMoves = roomRoundMoves.get(room.roomCode);
        const moveRecord = {
          sequence: currentMoves.length + 1,
          playerId,
          mark: validation.playerSeat.mark,
          cellIndex,
          timestamp: new Date(),
        };
        currentMoves.push(moveRecord);

        await room.save();

        const moveAcceptedPayload = {
          cellIndex,
          mark: validation.playerSeat.mark,
          playerId,
          nextTurn: room.currentTurn,
          stateVersion: room.stateVersion,
          board: room.board,
          lastMove: room.lastMove,
        };

        if (typeof callback === 'function') callback({ success: true, data: moveAcceptedPayload });

        // Broadcast to all clients in the room
        io.to(room.roomCode).emit('game:move-accepted', moveAcceptedPayload);

        // If the game ended on this move
        if (moveOutcome.finished) {
          const startedAt = roomRoundStartTimes.get(room.roomCode) || new Date();
          
          // Persist completed round & update leaderboard stats
          try {
            await recordCompletedRound({
              room,
              moves: currentMoves,
              startedAt,
            });
          } catch (statErr) {
            logger.error('Failed to record round stats:', statErr);
          }

          const scoresObj = room.scores instanceof Map
            ? Object.fromEntries(room.scores)
            : room.scores || {};

          const roundFinishedPayload = {
            winnerMark: room.roundResult.winnerMark,
            winnerId: room.roundResult.winnerId,
            isDraw: room.roundResult.isDraw,
            winningLine: room.roundResult.winningLine,
            scores: scoresObj,
            finalBoard: room.board,
          };

          io.to(room.roomCode).emit('game:round-finished', roundFinishedPayload);
        }
      } catch (err) {
        logger.error('Error handling game:move:', err);
        sendError(callback, 'game:move', 'An error occurred while processing move.');
      }
    });

    /**
     * EVENT: game:rematch-request
     */
    socket.on('game:rematch-request', async (data, callback) => {
      try {
        const roomCode = data?.roomCode?.toUpperCase();
        if (!roomCode) {
          return sendError(callback, 'game:rematch-request', 'Room code is required.');
        }

        // Atomically add player to rematchRequests
        const room = await GameRoom.findOneAndUpdate(
          { roomCode, status: 'FINISHED' },
          { $addToSet: { rematchRequests: playerId } },
          { new: true }
        );

        if (!room) {
          return sendError(callback, 'game:rematch-request', 'Cannot request rematch now.', 'INVALID_REMATCH_STATE');
        }

        const isPlayer = room.players.some((p) => p.playerId === playerId);
        if (!isPlayer) {
          return sendError(callback, 'game:rematch-request', 'You are not a player in this room.');
        }

        // Both players agreed to rematch!
        if (room.rematchRequests.length >= 2) {
          resetRoundForRematch(room);
          roomRoundMoves.set(room.roomCode, []);
          roomRoundStartTimes.set(room.roomCode, new Date());
          await room.save();

          const scoresObj = room.scores instanceof Map
            ? Object.fromEntries(room.scores)
            : room.scores || {};

          const rematchStartPayload = {
            room,
            roundNumber: room.roundNumber,
            currentTurn: room.currentTurn,
            scores: scoresObj,
          };

          if (typeof callback === 'function') callback({ success: true, started: true });
          io.to(room.roomCode).emit('game:rematch-started', rematchStartPayload);
        } else {
          const rematchStatusPayload = {
            rematchRequests: room.rematchRequests,
            requestedBy: playerId,
          };

          if (typeof callback === 'function') callback({ success: true, started: false });
          io.to(room.roomCode).emit('game:rematch-status', rematchStatusPayload);
        }
      } catch (err) {
        logger.error('Error handling rematch request:', err);
        sendError(callback, 'game:rematch-request', 'Failed to request rematch.');
      }
    });

    /**
     * EVENT: chat:send
     */
    socket.on('chat:send', async (data, callback) => {
      try {
        const { roomCode, text } = data || {};
        if (!roomCode || typeof text !== 'string') return;

        const trimmed = text.trim();
        if (trimmed.length === 0 || trimmed.length > ENV.MAX_CHAT_MESSAGE_LENGTH) {
          return sendError(callback, 'chat:send', `Message must be between 1 and ${ENV.MAX_CHAT_MESSAGE_LENGTH} characters.`);
        }

        // Rate limit: max 5 messages per 3 seconds per socket
        const now = Date.now();
        const timestamps = (socketMessageTimes.get(socket.id) || []).filter((t) => now - t < 3000);
        if (timestamps.length >= 5) {
          return sendError(callback, 'chat:send', 'Chat rate limit reached. Please slow down.', 'CHAT_RATE_LIMIT');
        }
        timestamps.push(now);
        socketMessageTimes.set(socket.id, timestamps);

        const room = await getRoomByCode(roomCode);
        if (!room) return;

        const playerSeat = room.players.find((p) => p.playerId === playerId);
        const mark = playerSeat ? playerSeat.mark : 'SYSTEM';

        // Escape text for safety against injection
        const sanitizedText = trimmed
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        const messagePayload = {
          messageId: `msg_${nanoid(10)}`,
          roomCode: room.roomCode,
          senderId: playerId,
          senderNickname: nickname,
          senderMark: mark,
          text: sanitizedText,
          timestamp: new Date().toISOString(),
        };

        // Async save to chat history
        ChatMessage.create({
          messageId: messagePayload.messageId,
          roomCode: messagePayload.roomCode,
          senderId: messagePayload.senderId,
          senderNickname: messagePayload.senderNickname,
          senderMark: messagePayload.senderMark,
          text: sanitizedText,
        }).catch((e) => logger.warn('Failed to persist chat message:', e.message));

        if (typeof callback === 'function') callback({ success: true, data: messagePayload });
        io.to(room.roomCode).emit('chat:message', messagePayload);
      } catch (err) {
        logger.error('Error handling chat:send:', err);
      }
    });

    /**
     * EVENT: room:leave
     */
    socket.on('room:leave', async (data, callback) => {
      try {
        const roomCode = data?.roomCode?.toUpperCase();
        if (!roomCode) return;

        socket.leave(roomCode);
        await updatePlayerConnection(roomCode, playerId, false);

        socket.to(roomCode).emit('room:player-left', {
          playerId,
          nickname,
          reason: 'USER_LEFT',
        });

        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        logger.error('Error handling room:leave:', err);
      }
    });

    /**
     * DISCONNECT LIFECYCLE
     */
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${nickname} (${playerId}) [reason: ${reason}]`);
      socketMessageTimes.delete(socket.id);

      // Only clean up in DB if database is connected
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState !== 1) return;

      try {
        const { GameRoom } = await import('../models/GameRoom.js');
        const activeRooms = await GameRoom.find({
          'players.playerId': playerId,
          status: { $in: ['WAITING', 'PLAYING'] },
        });

        for (const room of activeRooms) {
          await updatePlayerConnection(room.roomCode, playerId, false);

          io.to(room.roomCode).emit('player:connection-status', {
            playerId,
            connected: false,
            gracePeriodMs: ENV.RECONNECTION_GRACE_PERIOD_MS,
          });

          // Setup reconnection grace period timer
          const timerKey = `${room.roomCode}_${playerId}`;
          const timer = setTimeout(async () => {
            try {
              const currentRoom = await GameRoom.findOne({ roomCode: room.roomCode });
              if (!currentRoom || currentRoom.status !== 'PLAYING') return;

              const seated = currentRoom.players.find((p) => p.playerId === playerId);
              if (seated && !seated.connected) {
                // Grace period expired while match in progress: Declare forfeit
                const remainingPlayer = currentRoom.players.find((p) => p.playerId !== playerId);
                if (remainingPlayer && remainingPlayer.connected) {
                  currentRoom.status = 'FINISHED';
                  currentRoom.roundResult = {
                    winnerMark: remainingPlayer.mark,
                    winnerId: remainingPlayer.playerId,
                    isDraw: false,
                    winningLine: [],
                    finishedAt: new Date(),
                  };
                  await currentRoom.save();

                  const startedAt = roomRoundStartTimes.get(currentRoom.roomCode) || new Date();
                  await recordCompletedRound({
                    room: currentRoom,
                    moves: roomRoundMoves.get(currentRoom.roomCode) || [],
                    startedAt,
                  });

                  io.to(currentRoom.roomCode).emit('game:round-finished', {
                    winnerMark: remainingPlayer.mark,
                    winnerId: remainingPlayer.playerId,
                    isDraw: false,
                    winningLine: [],
                    forfeit: true,
                    forfeitedBy: playerId,
                    scores: Object.fromEntries(currentRoom.scores),
                  });
                }
              }
            } catch (timeoutErr) {
              logger.error('Error in disconnect grace period timeout:', timeoutErr);
            } finally {
              disconnectTimers.delete(timerKey);
            }
          }, ENV.RECONNECTION_GRACE_PERIOD_MS);

          disconnectTimers.set(timerKey, timer);
        }
      } catch (err) {
        logger.error('Error during disconnect cleanup:', err);
      }
    });
  });

  return io;
};
