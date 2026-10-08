import { Injectable } from '@nestjs/common';
import { buildOtpEmail } from './email-templates';
import { sendEmail } from './mail.util';

@Injectable()
export class NotificationService {
  async supplierStatus(email: string | undefined, businessName: string, status: 'approved' | 'rejected', reason?: string) {
    if (!email) return { sent: false, reason: 'missing-email' };
    const subject = status === 'approved' ? 'Your DOVA supplier application was approved' : 'Update on your DOVA supplier application';
    const text =
      status === 'approved'
        ? `Hello ${businessName},\n\nYour supplier application on DOVA is approved. Sign in to list products and manage orders.\n\n— DOVA`
        : `Hello ${businessName},\n\nYour supplier application on DOVA was not approved this time.${reason ? `\n\nReason: ${reason}` : ''}\n\nYou may update your documents and apply again.\n\n— DOVA`;
    return sendEmail({ to: email, subject, text });
  }

  async verificationOtp(email: string, code: string, fullName: string) {
    const message = buildOtpEmail('verification', fullName, code);
    return sendEmail({ to: email, subject: message.subject, text: message.text, html: message.html });
  }

  async passwordResetOtp(email: string, code: string, fullName: string) {
    const message = buildOtpEmail('password-reset', fullName, code);
    return sendEmail({ to: email, subject: message.subject, text: message.text, html: message.html });
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
