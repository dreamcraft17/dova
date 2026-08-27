import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async supplierStatus(email: string | undefined, businessName: string, status: 'approved' | 'rejected', reason?: string) {
    if (!email) return { sent: false, reason: 'missing-email' };
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) return { sent: false, reason: 'email-provider-not-configured' };
    const subject = status === 'approved' ? 'Your DOVA supplier application was approved' : 'Update on your DOVA supplier application';
    const text = status === 'approved' ? `Hello ${businessName}, your supplier application is approved.` : `Hello ${businessName}, your supplier application was rejected.${reason ? ` Reason: ${reason}` : ''}`;
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [email], subject, text }) });
    if (!response.ok) return { sent: false, reason: 'provider-error' };
    return { sent: true };
  }

  async verificationOtp(email: string, code: string, fullName: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) return { sent: false, reason: 'email-provider-not-configured' };
    const subject = 'Verify your DOVA account';
    const text = `Hello ${fullName},\n\nYour DOVA email verification code is ${code}. It expires in 10 minutes.\n\nIf you did not create an account, you can ignore this email.`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject, text }),
    });
    if (!response.ok) return { sent: false, reason: 'provider-error' };
    return { sent: true };
  }

  async contactMessage(payload: { name: string; email: string; message: string }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const support = process.env.SUPPORT_EMAIL || from;
    if (!apiKey || !from || !support) return { sent: false, reason: 'email-provider-not-configured' };
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [support],
        reply_to: payload.email,
        subject: `DOVA contact from ${payload.name}`,
        text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
      }),
    });
    if (!response.ok) return { sent: false, reason: 'provider-error' };
    return { sent: true };
  }
}
