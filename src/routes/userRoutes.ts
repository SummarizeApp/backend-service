import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getUserProfileController, updateUserStatsController } from '../controllers/userController';

const router = Router();

router.get('/profile', authenticate, getUserProfileController);
router.get('/stats', authenticate, updateUserStatsController);

export default router;