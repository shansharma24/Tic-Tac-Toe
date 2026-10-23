import { Router } from 'express';
import {
  createOrRecoverGuestSession,
  getCurrentGuest,
  updateNickname,
} from '../controllers/authController.js';
import { requireGuestAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { createSessionSchema, updateNicknameSchema } from '../validators/schemas.js';
import { sessionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/guest/session', sessionLimiter, validateBody(createSessionSchema), createOrRecoverGuestSession);
router.get('/guest/me', requireGuestAuth, getCurrentGuest);
router.patch('/guest/nickname', requireGuestAuth, validateBody(updateNicknameSchema), updateNickname);

export default router;
