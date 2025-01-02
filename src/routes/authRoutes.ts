import { Router, Request, Response } from 'express';
import { registerController, loginController, refreshTokenController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { ApiResponse } from '../utils/apiResponse';
import { JwtPayload } from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { validate } from '../middlewares/validationMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';
import { verifyOTPController } from '../controllers/otpController';
import { resendOTPController } from '../controllers/otpController';

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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               username:
 *                 type: string
 *                 example: john_doe
 *               connactNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR...
 *                     refreshToken:
 *                       type: string
 *                       example: dXNlcjEyM0Bkb21haW4uY29...
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 */
router.post('/register', authLimiter, validate(registerSchema), registerController);

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
router.post('/login', authLimiter, validate(loginSchema), loginController);

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
router.post('/refresh-token', authLimiter, refreshTokenController);

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

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               otpCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/verify-otp', verifyOTPController);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP code
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
 *     responses:
 *       200:
 *         description: OTP code resent successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
router.post('/resend-otp', resendOTPController);

export default router;