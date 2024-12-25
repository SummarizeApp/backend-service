import { Request, Response } from 'express';
import { register, login } from '../services/authService';

export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await register(email, password);
        res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email } });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token = await login(email, password);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
