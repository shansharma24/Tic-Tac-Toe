import { Router } from 'express';
import { getMatchHistory, getRoundReplay } from '../controllers/historyController.js';
import { requireGuestAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/history', requireGuestAuth, getMatchHistory);
router.get('/history/:roundId', getRoundReplay);

export default router;
