import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: {
    sendMail: (arg0: { to: string; subject: string; html: string }) => any;
  };

  constructor(private cfg: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: cfg.get('SMTP_HOST'),
      port: cfg.get<number>('SMTP_PORT'),
      auth: {
        user: cfg.get('SMTP_USER'),
        pass: cfg.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.cfg.get('FRONTEND_URL')}/verify?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Email Verification',
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${this.cfg.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
    });
  }
}
