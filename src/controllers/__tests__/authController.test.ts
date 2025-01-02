import { Request, Response } from 'express';
import { registerController, loginController, refreshTokenController } from '../authController';
import { register, login, refreshTokens } from '../../services/authService';
import { ApiResponse } from '../../utils/apiResponse';
import { generateOTP } from '../../services/otpService';

jest.mock('../../services/authService');
jest.mock('../../services/otpService');
jest.mock('../../utils/apiResponse');

describe('Auth Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('registerController', () => {
        it('should register a user and generate OTP', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123',
                username: 'testuser',
                connactNumber: '+1234567890'
            };

            const mockUserId = '123456';
            (register as jest.Mock).mockResolvedValue({ userId: mockUserId });
            (generateOTP as jest.Mock).mockResolvedValue(undefined);

            await registerController(req as Request, res as Response);

            expect(register).toHaveBeenCalledWith(
                req.body.email,
                req.body.password,
                req.body.username,
                req.body.connactNumber
            );

            expect(generateOTP).toHaveBeenCalledWith(mockUserId, req.body.email);

            expect(ApiResponse.success).toHaveBeenCalledWith(
                res,
                'Registration successful. Please check your email for verification code.',
                { userId: mockUserId },
                201
            );
        });

        it('should handle registration error', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123',
                username: 'testuser',
                connactNumber: '+1234567890'
            };

            const error = new Error('Registration failed');
            (register as jest.Mock).mockRejectedValue(error);

            await registerController(req as Request, res as Response);

            expect(ApiResponse.badRequest).toHaveBeenCalledWith(res, error.message);
        });
    });

    describe('loginController', () => {
        it('should login successfully', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
            (login as jest.Mock).mockResolvedValue(mockTokens);

            await loginController(req as Request, res as Response);

            expect(login).toHaveBeenCalledWith(req.body.email, req.body.password);
            expect(ApiResponse.success).toHaveBeenCalledWith(
                res,
                'Login successful',
                mockTokens
            );
        });

        it('should handle login error', async () => {
            req.body = { email: 'test@example.com', password: 'wrong-password' };
            const error = new Error('Invalid credentials');
            (login as jest.Mock).mockRejectedValue(error);

            await loginController(req as Request, res as Response);

            expect(ApiResponse.unauthorized).toHaveBeenCalledWith(res, error.message);
        });
    });

    describe('refreshTokenController', () => {
        it('should refresh tokens successfully', async () => {
            req.body = { refreshToken: 'valid-refresh-token' };
            const mockNewTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
            (refreshTokens as jest.Mock).mockResolvedValue(mockNewTokens);

            await refreshTokenController(req as Request, res as Response);

            expect(refreshTokens).toHaveBeenCalledWith(req.body.refreshToken);
            expect(ApiResponse.success).toHaveBeenCalledWith(
                res,
                'Tokens refreshed successfully',
                mockNewTokens
            );
        });

        it('should handle refresh error', async () => {
            req.body = { refreshToken: 'invalid-token' };
            const error = new Error('Invalid refresh token');
            (refreshTokens as jest.Mock).mockRejectedValue(error);

            await refreshTokenController(req as Request, res as Response);

            expect(ApiResponse.unauthorized).toHaveBeenCalledWith(res, error.message);
        });
    });
});