import { verifyGuestToken } from '../utils/token.js';

export const requireGuestAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No guest token provided.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyGuestToken(token);

  if (!decoded || !decoded.playerId) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired guest session. Please refresh your session.',
      code: 'INVALID_TOKEN',
    });
  }

  req.guest = decoded;
  next();
};

export const optionalGuestAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyGuestToken(token);
    if (decoded) {
      req.guest = decoded;
    }
  }
  next();
};
