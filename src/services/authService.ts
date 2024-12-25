import { User, IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const register = async (email: string, password: string): Promise<IUser> => {
    Logger.info(`Registering user with email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        Logger.warn(`Registration failed: Email already in use (${email})`);
        throw new Error('Email already in use');
    }
    const user = new User({ email, password });
    await user.save();
    Logger.info(`User registered successfully with email: ${email}`);
    return user;
};

export const login = async (email: string, password: string): Promise<string> => {
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

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    Logger.info(`Login successful for email: ${email}`);
    return token;
};