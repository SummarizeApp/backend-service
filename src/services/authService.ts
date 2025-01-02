import { User, IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { emailService } from './emailService';
import OTP from '../models/otpModel';
import { generateOTP } from './otpService';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';

export const register = async (
    email: string, 
    password: string,
    username: string,
    connactNumber?: string
): Promise<{ userId: string }> => {
    logger.info(`Registering user with email: ${email}, username: ${username}`);
    
    const verifiedUserByEmail = await User.findOne({ email, isVerified: true });
    if (verifiedUserByEmail) {
        logger.warn(`Registration failed: Email already verified and in use (${email})`);
        throw new Error('Email already in use');
    }

    const verifiedUserByUsername = await User.findOne({ username, isVerified: true });
    if (verifiedUserByUsername) {
        logger.warn(`Registration failed: Username already verified and in use (${username})`);
        throw new Error('Username already in use');
    }

    const unverifiedUser = await User.findOne({ 
        $or: [
            { email, isVerified: false },
            { username, isVerified: false }
        ]
    });

    if (unverifiedUser) {
        logger.info(`Found unverified user, deleting old registration: ${email}`);
        await OTP.deleteMany({ userId: unverifiedUser._id });
        await unverifiedUser.deleteOne();
    }

    const user: IUser = new User({ 
        email, 
        password, 
        username, 
        connactNumber,
        isVerified: false
    });
    await user.save();
    
    logger.info(`User registered successfully with email: ${email}`);
    return { userId: user._id.toString() };
};

export const verifyUserEmail = async (userId: string): Promise<{ accessToken: string, refreshToken: string }> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    user.isVerified = true;
    await user.save();

    await emailService.sendWelcomeEmail(user.email, user.username);

    return generateTokens(user);
};

export const login = async (email: string, password: string): Promise<{ accessToken: string, refreshToken: string } | { userId: string, requiresVerification: true }> => {
    try {
        logger.info(`Login attempt for email: ${email}`);
        
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Login failed: User not found (${email})`);
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password for email (${email})`);
            throw new Error('Invalid email or password');
        }

        if (!user.isVerified) {
            logger.warn(`Login failed: Email not verified (${email})`);
            
            await generateOTP(user._id.toString(), email);

            return {
                userId: user._id.toString(),
                requiresVerification: true
            };
        }

        logger.info(`Login successful for email: ${email}`);
        return generateTokens(user);
    } catch (error) {
        logger.error(`Login error for email ${email}:`, error);
        throw error;
    }
};

export const generateTokens = (user: IUser) => {
    const accessToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const refreshTokens = async (refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> => {
    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as IUser;
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }
        return generateTokens(user);
    } catch (error) {
        logger.error('Error refreshing tokens', error);
        throw new Error('Invalid refresh token');
    }
};