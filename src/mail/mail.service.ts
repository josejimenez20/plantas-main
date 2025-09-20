import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const mailOptions = {
      from: `"Soporte" <${process.env.MAIL_FROM}>`,
      to,
      subject: 'Restablece tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Recuperación de contraseña</h2>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
          <p>Este enlace expirará en 1 hora.</p>
        </div>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
