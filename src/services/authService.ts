import { User, IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { sendEmail } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';

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

export const register = async (
    email: string, 
    password: string,
    username: string,
    connactNumber?: string
): Promise<{ accessToken: string, refreshToken: string }> => {
    logger.info(`Registering user with email: ${email}, username: ${username}, connactNumber: ${connactNumber}`);
    
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
        logger.warn(`Registration failed: Email already in use (${email})`);
        throw new Error('Email already in use');
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
        logger.warn(`Registration failed: Username already in use (${username})`);
        throw new Error('Username already in use');
    }

    const user = new User({ email, password, username, connactNumber });
    await user.save();
    logger.info(`User registered successfully with email: ${email}, username: ${username}, connactNumber: ${connactNumber}`);

    await sendEmail(email, 'Welcome to Our Service', 'Thank you for registering!');

    return generateTokens(user);
};

export const login = async (email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> => {
    logger.info(`Login attempt for email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
        logger.warn(`Login failed: Invalid email or password (${email})`);
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for email (${email})`);
        throw new Error('Invalid email or password');
    }

    logger.info(`Login successful for email: ${email}`);
    return generateTokens(user);
};