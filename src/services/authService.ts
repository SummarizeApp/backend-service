import { User, IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';

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
        Logger.error('Error refreshing tokens', error);
        throw new Error('Invalid refresh token');
    }
};

export const register = async (email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> => {
    Logger.info(`Registering user with email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        Logger.warn(`Registration failed: Email already in use (${email})`);
        throw new Error('Email already in use');
    }
    const user = new User({ email, password });
    await user.save();
    Logger.info(`User registered successfully with email: ${email}`);
    return generateTokens(user);
};

export const login = async (email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> => {
    Logger.info(`Login attempt for email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
        Logger.warn(`Login failed: Invalid email or password (${email})`);
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        Logger.warn(`Login failed: Invalid password for email (${email})`);
        throw new Error('Invalid email or password');
    }

    Logger.info(`Login successful for email: ${email}`);
    return generateTokens(user);
};