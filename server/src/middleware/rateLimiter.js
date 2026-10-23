import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

export const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // 60 session creations per 15 min per IP
  message: {
    success: false,
    error: 'Too many guest sessions initiated. Please wait before trying again.',
    code: 'SESSION_RATE_LIMIT',
  },
});

export const roomCreateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30, // 30 rooms per 5 min per IP
  message: {
    success: false,
    error: 'Too many rooms created. Please wait before creating more.',
    code: 'ROOM_CREATE_LIMIT',
  },
});
