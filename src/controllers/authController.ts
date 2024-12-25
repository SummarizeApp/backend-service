import { Request, Response } from 'express';
import { register, login } from '../services/authService';
import { Logger } from '../utils/logger';

export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        Logger.info(`Register request for email: ${email}`);

        const user = await register(email, password);
        res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email } });
    } catch (error: any) {
        Logger.error('Error in registerController', error);
        res.status(400).json({ error: error.message });
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        Logger.info(`Login attempt for email: ${email}`);
        const token = await login(email, password);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error: any) {
        Logger.error('Error in loginController', error);
        res.status(400).json({ error: error.message });
    }
};
