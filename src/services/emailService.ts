import nodemailer from 'nodemailer';
import { Logger } from '../utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        Logger.info(`Email sent to ${to}`);
    } catch (error) {
        Logger.error('Error sending email', error);
        Logger.error(`SMTP Configuration: ${JSON.stringify(transporter.options)}`);
        throw error;
    }
};