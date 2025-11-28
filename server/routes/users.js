import express from 'express';
import { getAllUsers, getUserProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllUsers);
router.get('/:userId', authenticate, getUserProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
