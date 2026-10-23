import { logger } from '../config/logger.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled server error:', err);

  const status = err.status || 500;
  const message =
    ENV.NODE_ENV === 'production' && status === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(ENV.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
