import { verifyGuestToken } from '../utils/token.js';
import { logger } from '../config/logger.js';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    logger.debug(`Socket connection rejected: No auth token provided (${socket.id})`);
    return next(new Error('Authentication token required'));
  }

  const decoded = verifyGuestToken(token);
  if (!decoded || !decoded.playerId) {
    logger.debug(`Socket connection rejected: Invalid auth token (${socket.id})`);
    return next(new Error('Invalid or expired authentication token'));
  }

  socket.guest = decoded;
  next();
};
