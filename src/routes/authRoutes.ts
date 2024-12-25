import { Router, Request, Response } from 'express';
import { registerController, loginController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { ApiResponse } from '../utils/apiResponse';
import { JwtPayload } from 'jsonwebtoken';

const router = Router();
interface AuthRequest extends Request {
    user?: string | JwtPayload; 
}

router.post('/register', registerController);
router.post('/login', loginController);

router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
    const user = req.user; 
    ApiResponse.success(res, 'User profile fetched successfully', { user });
});

export default router;
