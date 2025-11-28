import express from 'express';
import { getRoomMessages, getPrivateMessages } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/room/:room', authenticate, getRoomMessages);
router.get('/private/:userId', authenticate, getPrivateMessages);

export default router;
