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
}
