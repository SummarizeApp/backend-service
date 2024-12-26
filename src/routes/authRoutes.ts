import { Router, Request, Response } from 'express';
import { registerController, loginController, refreshTokenController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { ApiResponse } from '../utils/apiResponse';
import { JwtPayload } from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { validate } from '../middlewares/validationMiddleware';

const router = Router();
interface AuthRequest extends Request {
    user?: string | JwtPayload; 
}

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/refresh-token', refreshTokenController);

router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
    const user = req.user; 
    ApiResponse.success(res, 'User profile fetched successfully', { user });
});

export default router;