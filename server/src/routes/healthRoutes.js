import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: states[dbState] || 'unknown',
  });
});

router.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'ready' });
  }
  return res.status(503).json({ status: 'not ready', database: 'not connected' });
});

export default router;
