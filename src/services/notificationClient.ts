import amqp from 'amqplib';
import logger from '../utils/logger';

interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
}

class NotificationClient {
  private static instance: NotificationClient;
  private channel: amqp.Channel | null = null;
  private readonly queueName = 'notification_queue';
  private readonly rabbitmqUrl: string;

  private constructor() {
    this.rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
  }

  public static getInstance(): NotificationClient {
    if (!NotificationClient.instance) {
      NotificationClient.instance = new NotificationClient();
    }
    return NotificationClient.instance;
  }

  private async connect(): Promise<void> {
    try {
      if (!this.channel) {
        const connection = await amqp.connect(this.rabbitmqUrl);
        this.channel = await connection.createChannel();
        await this.channel.assertQueue(this.queueName, { durable: true });
        logger.info('Connected to RabbitMQ');
      }
    } catch (error) {
      logger.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  public async sendEmail(emailData: EmailMessage): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const message = Buffer.from(JSON.stringify(emailData));
      this.channel?.sendToQueue(this.queueName, message, { persistent: true });
      
      logger.info('Email request queued:', { 
        to: emailData.to, 
        subject: emailData.subject,
        template: emailData.template,
        queueName: this.queueName,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Failed to queue email:', {
        to: emailData.to,
        subject: emailData.subject,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // OTP Email
  public async sendOTPEmail(email: string, otp: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Email Verification OTP',
      template: 'otpVerification',
      templateData: { otp }
    });
  }

  // Welcome Email
  public async sendWelcomeEmail(email: string, username: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Platform',
      template: 'welcome',
      templateData: { username }
    });
  }

  // Password Reset Email
  public async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'passwordReset',
      templateData: { resetLink }
    });
  }
}

export default NotificationClient; 