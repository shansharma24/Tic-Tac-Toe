import { Router } from 'express';
import { getLeaderboard, getPlayerStats } from '../controllers/leaderboardController.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/players/:playerId/stats', getPlayerStats);

export default router;
