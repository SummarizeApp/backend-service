import { Request, Response } from 'express';
import { registerController, loginController, refreshTokenController } from '../authController';
import { register, login, refreshTokens } from '../../services/authService';
import { ApiResponse } from '../../utils/apiResponse';

jest.mock('../../services/authService');
jest.mock('../../utils/apiResponse');

describe('Auth Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('registerController', () => {
        it('should register a user and return tokens', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            (register as jest.Mock).mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

            await registerController(req as Request, res as Response);

            expect(register).toHaveBeenCalledWith('test@example.com', 'password');
            expect(ApiResponse.success).toHaveBeenCalledWith(res, 'User registered successfully', { accessToken: 'access', refreshToken: 'refresh' }, 201);
        });

        it('should handle errors', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            (register as jest.Mock).mockRejectedValue(new Error('Registration error'));

            await registerController(req as Request, res as Response);

            expect(ApiResponse.badRequest).toHaveBeenCalledWith(res, 'Registration error');
        });
    });

    describe('loginController', () => {
        it('should login a user and return tokens', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            (login as jest.Mock).mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

            await loginController(req as Request, res as Response);

            expect(login).toHaveBeenCalledWith('test@example.com', 'password');
            expect(ApiResponse.success).toHaveBeenCalledWith(res, 'Login successful', { accessToken: 'access', refreshToken: 'refresh' });
        });

        it('should handle errors', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            (login as jest.Mock).mockRejectedValue(new Error('Login error'));

            await loginController(req as Request, res as Response);

            expect(ApiResponse.unauthorized).toHaveBeenCalledWith(res, 'Login error');
        });
    });

    describe('refreshTokenController', () => {
        it('should refresh tokens', async () => {
            req.body = { refreshToken: 'refresh' };
            (refreshTokens as jest.Mock).mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

            await refreshTokenController(req as Request, res as Response);

            expect(refreshTokens).toHaveBeenCalledWith('refresh');
            expect(ApiResponse.success).toHaveBeenCalledWith(res, 'Tokens refreshed successfully', { accessToken: 'access', refreshToken: 'refresh' });
        });

        it('should handle errors', async () => {
            req.body = { refreshToken: 'refresh' };
            (refreshTokens as jest.Mock).mockRejectedValue(new Error('Refresh error'));

            await refreshTokenController(req as Request, res as Response);

            expect(ApiResponse.unauthorized).toHaveBeenCalledWith(res, 'Refresh error');
        });
    });
});