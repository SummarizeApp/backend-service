import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { JwtPayload } from 'jsonwebtoken';

import { getUserProfileController } from '../controllers/userController';

const router = Router();
interface AuthRequest extends Request {
    user?: string | JwtPayload; 
}


router.get('/profile', authenticate, getUserProfileController);


export default router;