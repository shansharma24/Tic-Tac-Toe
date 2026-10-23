import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (ENV.CLIENT_ORIGINS.indexOf(origin) !== -1 || ENV.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Global API rate limit
  app.use('/api', apiLimiter);

  // Mount API Endpoints
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1', authRoutes);
  app.use('/api/v1', roomRoutes);
  app.use('/api/v1', leaderboardRoutes);
  app.use('/api/v1', historyRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
