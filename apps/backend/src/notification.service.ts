import { Injectable } from '@nestjs/common';
import { sendEmail } from './mail.util';

@Injectable()
export class NotificationService {
  async supplierStatus(email: string | undefined, businessName: string, status: 'approved' | 'rejected', reason?: string) {
    if (!email) return { sent: false, reason: 'missing-email' };
    const subject = status === 'approved' ? 'Your DOVA supplier application was approved' : 'Update on your DOVA supplier application';
    const text =
      status === 'approved'
        ? `Hello ${businessName}, your supplier application is approved.`
        : `Hello ${businessName}, your supplier application was rejected.${reason ? ` Reason: ${reason}` : ''}`;
    return sendEmail({ to: email, subject, text });
  }

  async verificationOtp(email: string, code: string, fullName: string) {
    const subject = 'Verify your DOVA account';
    const text = `Hello ${fullName},\n\nYour DOVA email verification code is ${code}. It expires in 10 minutes.\n\nIf you did not create an account, you can ignore this email.`;
    return sendEmail({ to: email, subject, text });
  }

  async passwordResetOtp(email: string, code: string, fullName: string) {
    const subject = 'Reset your DOVA password';
    const text = `Hello ${fullName},\n\nYour DOVA password reset code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.`;
    return sendEmail({ to: email, subject, text });
  }

  async contactMessage(payload: { name: string; email: string; message: string }) {
    const support = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM;
    if (!support) return { sent: false, reason: 'email-provider-not-configured' };
    return sendEmail({
      to: support,
      replyTo: payload.email,
      subject: `DOVA contact from ${payload.name}`,
      text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    });
  }
}
