import nodemailer from 'nodemailer';
import logger from '../utils/logger';
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
        logger.info(`Email sent to ${to}`);
    } catch (error) {
        logger.error('Error sending email', error);
        logger.error(`SMTP Configuration: ${JSON.stringify(transporter.options)}`);
        throw error;
    }
};