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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', validate(registerSchema), registerController);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post('/login', validate(loginSchema), loginController);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/refresh-token', refreshTokenController);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
    const user = req.user; 
    ApiResponse.success(res, 'User profile fetched successfully', { user });
});

export default router;