import nodemailer from 'nodemailer';

export type SendMailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export function isEmailProviderConfigured() {
  if (!process.env.EMAIL_FROM) return false;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return true;
  return Boolean(process.env.RESEND_API_KEY);
}

export function usesSmtp() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);
}

export async function sendViaSmtp(input: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, '');
  const from = process.env.EMAIL_FROM;
  if (!host || !user || !pass || !from) return { sent: false, reason: 'email-provider-not-configured' };

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: host.includes('gmail.com'),
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });
    return { sent: true };
  } catch (error) {
    console.warn('[Mail] SMTP send failed:', (error as Error).message);
    return { sent: false, reason: 'provider-error' };
  }
}

export async function sendViaResend(input: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: 'email-provider-not-configured' };

  const to = Array.isArray(input.to) ? input.to : [input.to];
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      reply_to: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  if (!response.ok) return { sent: false, reason: 'provider-error' };
  return { sent: true };
}

export async function sendEmail(input: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  if (!isEmailProviderConfigured()) return { sent: false, reason: 'email-provider-not-configured' };
  if (usesSmtp()) return sendViaSmtp(input);
  return sendViaResend(input);
}
