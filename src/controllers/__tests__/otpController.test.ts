import { Request, Response } from 'express';
import { verifyOTPController, resendOTPController } from '../otpController';
import { verifyOTP, resendOTP } from '../../services/otpService';
import { verifyUserEmail } from '../../services/authService';
import { ApiResponse } from '../../utils/apiResponse';

jest.mock('../../services/otpService');
jest.mock('../../services/authService');
jest.mock('../../utils/apiResponse');

describe('OTP Controller', () => {
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

    describe('verifyOTPController', () => {
        it('should verify OTP successfully', async () => {
            const mockUserId = '123';
            const mockTokens = { accessToken: 'token', refreshToken: 'refresh' };
            
            req.body = { userId: mockUserId, otpCode: '123456' };
            (verifyOTP as jest.Mock).mockResolvedValue(true);
            (verifyUserEmail as jest.Mock).mockResolvedValue(mockTokens);

            await verifyOTPController(req as Request, res as Response);

            expect(verifyOTP).toHaveBeenCalledWith(mockUserId, '123456');
            expect(verifyUserEmail).toHaveBeenCalledWith(mockUserId);
            expect(ApiResponse.success).toHaveBeenCalledWith(
                res, 
                'Email verified successfully', 
                mockTokens
            );
        });

        it('should handle invalid OTP', async () => {
            req.body = { userId: '123', otpCode: '123456' };
            (verifyOTP as jest.Mock).mockResolvedValue(false);

            await verifyOTPController(req as Request, res as Response);

            expect(verifyOTP).toHaveBeenCalledWith('123', '123456');
            expect(ApiResponse.badRequest).toHaveBeenCalledWith(
                res, 
                'Invalid or expired OTP'
            );
        });
    });

    describe('resendOTPController', () => {
        it('should resend OTP successfully', async () => {
            req.body = { email: 'test@example.com' };
            (resendOTP as jest.Mock).mockResolvedValue(undefined);

            await resendOTPController(req as Request, res as Response);

            expect(resendOTP).toHaveBeenCalledWith('test@example.com');
            expect(ApiResponse.success).toHaveBeenCalledWith(
                res,
                'OTP code has been resent to your email'
            );
        });

        it('should handle resend OTP error', async () => {
            req.body = { email: 'test@example.com' };
            const error = new Error('Failed to resend');
            (resendOTP as jest.Mock).mockRejectedValue(error);

            await resendOTPController(req as Request, res as Response);

            expect(resendOTP).toHaveBeenCalledWith('test@example.com');
            expect(ApiResponse.internalServerError).toHaveBeenCalledWith(
                res,
                'Error resending OTP'
            );
        });
    });
}); 