import { Router } from 'express';
import {
  handleCreateRoom,
  handleJoinRoom,
  handleGetRoom,
} from '../controllers/roomController.js';
import { requireGuestAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { joinRoomSchema } from '../validators/schemas.js';
import { roomCreateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/rooms', requireGuestAuth, roomCreateLimiter, handleCreateRoom);
router.post('/rooms/join', requireGuestAuth, validateBody(joinRoomSchema), handleJoinRoom);
router.get('/rooms/:roomCode', requireGuestAuth, handleGetRoom);

export default router;
