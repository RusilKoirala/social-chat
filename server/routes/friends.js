import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  getFriendshipStatus,
  removeFriend
} from '../controllers/friendController.js';
import { authenticate } from '../middleware/auth.js';
import { friendRequestLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/request', authenticate, friendRequestLimiter, sendFriendRequest);
router.put('/request/:requestId/accept', authenticate, acceptFriendRequest);
router.put('/request/:requestId/reject', authenticate, rejectFriendRequest);
router.get('/requests', authenticate, getFriendRequests);
router.get('/', authenticate, getFriends);
router.get('/status/:userId', authenticate, getFriendshipStatus);
router.delete('/:userId', authenticate, removeFriend);

export default router;
